import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Prim "mo:⛔";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import SM "mo:base/ExperimentalStableMemory";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";
import TrieSet "mo:base/TrieSet";
import Stack "mo:base/Stack";
import Blob "mo:base/Blob";
import Order "mo:base/Order";
import Hash "mo:base/Hash";
import Hex "../module/Hex";
import Types "../module/Types";
import SHA256 "../module/SHA256";

shared(installer) actor class Bucket() = this{
    private type Asset = Types.Asset;
    private type AssetExt = Types.AssetExt;
    private type Chunk = Types.Chunk;
    private type PUT = Types.PUT;
    private type GET = Types.GET;
    private type State = Types.State;
    private type Extension = Types.FileExtension;
    private type BufferAsset = Types.BufferAsset;
    private let cycle_limit = 20_000_000_000_000;
    private let MAX_PAGE_NUMBER : Nat32 = 65535;
    private let PAGE_SIZE = 65536; // Byte
    private let THRESHOLD = 4294901760; // 65535 * 65536
    private let MAX_UPDATE_SIZE = 1992295;
    private let MAX_QUERY_SIZE = 3144728; // 3M - 1KB
    private let UPGRADE_SLICE = 6000; // 暂定
    private var allchipmem = 0; //all chip memory
    private var offset = 4; // [0, 65535*65536-1]
    private var buffer_canister_id = ""; // buffer canister id text
    private var keymap = TrieMap.TrieMap<Text, Text>(Text.equal, Text.hash);
    private var namemap = TrieMap.TrieMap<Text, Text>(Text.equal, Text.hash);
    private var assets = TrieMap.TrieMap<Text, Asset>(Text.equal, Text.hash); // file_key asset map
    private var chipset = TrieSet.empty<(Nat,  Nat)>(); // chip pagefield
    private var maxchip : (Nat,  Nat) = (0, 0); // max size chip
    private var buffer = HashMap.HashMap<Text, BufferAsset>(10, Text.equal, Text.hash);  

    //Nat pair hash&equal compare define
    private func _compareSize(x : (Nat,  Nat), y : (Nat,  Nat)) : Order.Order {
        if (x.1 > y.1) { #less }
        else if (x.1 == y.1) { #equal }
        else { #greater }
    };

    private func _compareStart(x : (Nat,  Nat), y : (Nat,  Nat)) : Order.Order {
        if (x.0 < y.0) { #less }
        else if (x.0 == y.0) { #equal }
        else { #greater }
    };
    
    private func _pairHash(t : (Nat,  Nat)) : Hash.Hash {
        let t1 : Text = Nat.toText(t.0);
        let t2 : Text = Nat.toText(t.1);
        let txt : Text = t1 # "-" # t2;
        var x : Nat32 = 5381;
        for (char in txt.chars()) {
            let c : Nat32 = Prim.charToNat32(char);
            x := ((x << 5) +% x) +% c;
        };
        return x
    };

    private func _pairEqual(t1 : (Nat,  Nat), t2 : (Nat,  Nat)) : Bool { 
        if (t1.0 == t2.0 and t1.1 == t2.1) {
            return true;
        } else {
            return false;
        };
    };

    private func _appendBuffer(buffer : [var (Nat, Nat)], arr : [var (Nat, Nat)]) : [var (Nat, Nat)]{
        switch(buffer.size(), arr.size()) {
            case (0, 0) { [var] };
            case (0, _) { arr };
            case (_, 0) { buffer };
            case (xsSize, ysSize) {
                let res = Array.init<(Nat, Nat)>(buffer.size() + arr.size(), (0, 0));
                var i = 0;
                for(e in buffer.vals()){
                    res[i] := buffer[i];
                    i += 1;
                };
                for(e in arr.vals()){
                    res[i] := arr[i - buffer.size()];
                    i += 1;
                };
                res
            };
        }
    };

    private func _getAssetExtkey(file_key : Text) : Result.Result<AssetExt, Text>{
        switch(assets.get(file_key)){
            case null { #err("wrong file_key") };
            case(?asset){ #ok(_assetExt(asset, true)) };
        }
    };

    private func _getAssetExtFilename(file_name : Text) : Result.Result<AssetExt, Text>{
        switch(namemap.get(file_name)) {
            case null { #err("User have not this file") };
            case (?key_) {
                switch(assets.get(key_)){
                    case null { #err("wrong file_key") };
                    case(?asset){ #ok(_assetExt(asset, true)) };
                }
            };    
        }       
    };

    private func _getAssetExts() : Result.Result<[AssetExt], Text>{
        if (keymap.size() == 0) {
            return #ok([]);
        };
        var x : AssetExt = {
            file_name = "0";
            bucket_id = installer.caller;
            upload_status = true;
            file_key = "0";
            total_size = 0;
            file_extension = #txt;
            need_query_times = 0;
        };
        var res = Array.init<AssetExt>(keymap.size(), x);
        var i = 0;
        for (e in keymap.keys()) {
            switch(assets.get(e)){
                case (null) { return #err("Get Asset failed"); };
                case (?asset) { res[i] := _assetExt(asset, true);	};
            };
            i += 1;
        };
        #ok(Array.freeze<AssetExt>(res)) 
    };

    private func _inspectsize(data : Blob) : Result.Result<Nat, Text>{
        var size = data.size();
        if(size <= _avlSMchunk1() or size <= _avlSMchunk2()){
            #ok(size)
        }else{
            #err("insufficient memory")
        }
    };

    private func _digest(pred : [var Nat8], nd : [Nat8], received : Nat){
        var i = received * 32;
        for(e in nd.vals()){
            pred[i] := e;
            i := i + 1;
        };
    };

    // delete clear function
    private func _clear(){
        offset := 4;
        allchipmem := 0;
        chipset := TrieSet.empty<(Nat,  Nat)>();
        maxchip := (0, 0);
        keymap := TrieMap.TrieMap<Text, Text>(Text.equal, Text.hash);
        namemap := TrieMap.TrieMap<Text, Text>(Text.equal, Text.hash);
        assets := TrieMap.TrieMap<Text, Asset>(Text.equal, Text.hash);
        buffer := HashMap.HashMap<Text, BufferAsset>(10, Text.equal, Text.hash);
    };

    private func chipmerge(){
        let chiparray : [(Nat, Nat)] = Array.sort(TrieSet.toArray<(Nat, Nat)>(chipset), _compareStart);
        var buffer : [var (Nat, Nat)] = [var];
        var tail = 0;
        var head = 0;
        for ((start, size) in chiparray.vals()) {
            if (tail != start) {
                if (tail != 0) {
                    buffer := _appendBuffer(buffer, [var (head, tail - head)]);
                };
                head := start;
            };
            tail := start + size;
        };
        buffer := _appendBuffer(buffer, [var (head, tail - head)]);
        Array.sortInPlace<(Nat, Nat)>(buffer, _compareSize);
        let res = Array.freeze<(Nat, Nat)>(buffer);
        maxchip := res[0];
        chipset := TrieSet.fromArray<(Nat, Nat)>(res, _pairHash, _pairEqual);
    };

    private func _delete(file_key : Text) : Result.Result<Bool, Text> {
        switch(keymap.get(file_key)) {
            case (?filename_) {
                keymap.delete(file_key);
                namemap.delete(filename_);
                switch(assets.get(file_key)) {
                    case (?asset) {
                        assets.delete(file_key);
                        let pagefields = asset.page_field;
                        allchipmem += asset.total_size;
                        for (pagefield in pagefields.vals()) {
                            for (page in pagefield.vals()) {
                                chipset := TrieSet.put<(Nat, Nat)>(chipset, page, _pairHash(page), _pairEqual);
                            };
                        };
                        chipmerge();
                        return #ok(true);
                    };
                    case (null) {return #err("user don't have the file");};
                };
            };
            case (null) { return #err("user don't have the file"); };
        };
    };

    // wirte page field -> query page field
    private func _pageField(buffer_page_field : [(Nat, Nat)], total_size : Nat) : [[(Nat, Nat)]]{
        var arrSize = 0;
        if(total_size % MAX_QUERY_SIZE == 0){
            arrSize := total_size / MAX_QUERY_SIZE;
        }else{
            arrSize := total_size / MAX_QUERY_SIZE + 1;
        };
        var res = Array.init<[(Nat, Nat)]>(arrSize, []);
        var i : Nat = 0;
        var rowSize : Nat = 0;
        var pre_start : Nat = 0;
        var pre_size : Nat = 0;
        var buffer : [var (Nat, Nat)] = [var];
        // merge query page field
        for((start, size) in buffer_page_field.vals()){
            if(rowSize + size <= MAX_QUERY_SIZE){
                if(start != 0 and pre_start + pre_size == start){
                    let li = buffer.size() - 1;
                    buffer[li] := (pre_start, pre_size + size);
                }else{
                    buffer := _appendBuffer(buffer, [var (start, size)]);
                    pre_start := start;
                    pre_size := size;
                };
                rowSize += size;
            }else if(rowSize == MAX_QUERY_SIZE){
                res[i] := Array.freeze(buffer);
                i := i + 1;
                buffer := [var (start, size)];
                pre_start := start;
                pre_size := size;
                rowSize := size;
            }else{
                assert(MAX_QUERY_SIZE > rowSize);
                if(start != 0 and pre_start + pre_size == start){
                    let li = buffer.size() - 1;
                    buffer[li] := (pre_start, pre_size + MAX_QUERY_SIZE - rowSize);
                }else{
                    buffer := _appendBuffer(buffer, [var (start, MAX_QUERY_SIZE - rowSize)])
                };
                res[i] := Array.freeze(buffer);
                i += 1;
                buffer := [var (start + MAX_QUERY_SIZE - rowSize, size - (MAX_QUERY_SIZE - rowSize))];
                pre_start := start + MAX_QUERY_SIZE - rowSize;
                pre_size := size - (MAX_QUERY_SIZE - rowSize);
                rowSize := size + rowSize - MAX_QUERY_SIZE;
            };
        };
        res[i] := Array.freeze(buffer);
        Array.freeze<[(Nat, Nat)]>(res)
    };

    // available stable wasm memory
    private func _avlSM() : Nat{
        THRESHOLD - offset + allchipmem + 1
    };

    private func _avlSMchunk1() : Nat{
        THRESHOLD - offset + 1
    };

    private func _avlSMchunk2() : Nat{
        maxchip.1
    };
    
    // return page field
    private func _putSM(data : Blob, size : Nat) : (Nat, Nat){
    
        let thr : Nat = THRESHOLD - offset + 1;
        if (thr < size) {   
            let st = maxchip.0;
            let sz = maxchip.1;
            SM.storeBlob(Nat32.fromNat(st), data);
            let ans = (st, size);
            chipset := TrieSet.delete(chipset, (st, sz), _pairHash((st, sz)), _pairEqual);
            chipset := TrieSet.put(chipset, (st + size, sz - size), _pairHash((st + size, sz - size)), _pairEqual);
            let chiparray : [(Nat, Nat)] = Array.sort(TrieSet.toArray<(Nat, Nat)>(chipset), _compareSize);
            maxchip := chiparray[0];
            allchipmem -= size;
            return ans;
        };
        
        // 看本页的内存还剩多少
        let page_left : Nat = if(offset == 4){
                ignore SM.grow(1);
                PAGE_SIZE - offset % PAGE_SIZE
            }else{
                PAGE_SIZE - offset % PAGE_SIZE
            };

        let res = (offset, size);

        // 如果够则记录到本页， 如果不够就grow
        if(size <= page_left){
            //本页够
            SM.storeBlob(Nat32.fromNat(offset), data);
            offset += data.size();
        }else {
            assert(SM.size() <= MAX_PAGE_NUMBER);
            ignore SM.grow(Nat32.fromNat((size - page_left) / PAGE_SIZE + 1));
            SM.storeBlob(Nat32.fromNat(offset), data);
            offset += data.size();
        };
        res
    };

    private func _getSM(field : [(Nat, Nat)]) : [Blob]{
        let res = Array.init<Blob>(field.size(), "" : Blob);
        var i = 0;
        for((start, size) in field.vals()){
            res[i] := SM.loadBlob(Nat32.fromNat(start), size);
            i := i + 1;
        };
        Array.freeze<Blob>(res)
    };

    private func _assetExt(asset : Asset, upload_status : Bool) : AssetExt{
        {
            file_name = asset.file_name;
            bucket_id = Principal.fromActor(this);
            file_key = asset.file_key;
            upload_status = upload_status;
            total_size = asset.total_size;
            file_extension = asset.file_extension;
            need_query_times = asset.page_field.size();
        }
    };

    private func _key(digests : [Nat8]) : Text{
        Hex.encode(SHA256.sha256(digests))
    };

    /**
    *	inspect file format and file size
    *	put file data into stable wasm memory
    *	put file asset into assets
    */
    private func _upload(file_key : Text, file_name : Text, chunk : Chunk, chunk_num : Nat, extension : Extension, order : Nat, size : Nat) : Result.Result<AssetExt, Text> {
        var size_ = size;
        var field = (0, 0);
        if (chunk_num == 1) {
            field := _putSM(chunk.data, size_);
            let asset = {
                file_name = file_name;
                file_key = _key(chunk.digest);
                total_size = size_;
                page_field = [[field]];
                file_extension = extension;
            };
            assets.put(asset.file_key, asset);
            keymap.put(asset.file_key, file_name);
            namemap.put(file_name, asset.file_key);
            Debug.print("final asset" # debug_show(asset));
            return #ok(_assetExt(asset, true));
        };
        switch(buffer.get(file_key)){
            case (null) {
                var digest = Array.init<Nat8>(chunk_num*32, 0);
                var page_field = Array.init<(Nat, Nat)>(chunk_num, (0,0));
                field := _putSM(chunk.data, size_);
                page_field[order] := field;
                _digest(digest, chunk.digest, order);
                let buffer_asset = {
                    digest = digest;
                    chunk_number = chunk_num;
                    var page_field = page_field;
                    var total_size = size_;
                    var received = 1;
                };
                buffer.put(file_key, buffer_asset);
                #ok(_assetExt(
                    {
                        file_name = file_name;
                        file_key = file_key;
                        page_field = [Array.freeze<(Nat, Nat)>(page_field)];
                        total_size = size_;
                        file_extension = extension;
                    }, false
                ))
            };
            case (?a){
                if(a.received + 1 == a.chunk_number){
                    _digest(a.digest, chunk.digest, order);
                    a.received += 1;
                    field := _putSM(chunk.data, size_);
                    a.page_field[order] := field;
                    let total_size = a.total_size + size_;
                    let digest = Array.freeze(a.digest);
                    let page_field = Array.freeze(a.page_field);
                    let asset = {
                        file_name = file_name;
                        file_key = _key(digest);
                        page_field = _pageField(page_field, total_size);
                        total_size = total_size;
                        file_extension = extension;
                    };
                    assets.put(asset.file_key, asset);
                    keymap.put(asset.file_key, file_name);
                    namemap.put(file_name, asset.file_key);
                    buffer.delete(file_key);
                    Debug.print("final asset" # debug_show(asset));
                    #ok(_assetExt(asset, true))
                }else{
                    _digest(a.digest, chunk.digest, order);
                    a.received += 1;
                    field := _putSM(chunk.data, size_);
                    a.page_field[order] := field;
                    a.total_size += size_;
                    #ok(_assetExt(
                        {
                            file_name = file_name;
                            file_key = file_key;
                            page_field = [Array.freeze<(Nat, Nat)>(a.page_field)];
                            total_size = a.total_size;
                            file_extension = extension;
                        }, false
                    ))
                }
            };
        }
    };

    public shared({caller}) func put(
        put : PUT
    ) : async Result.Result<AssetExt, Text>{
        switch(assets.get(put.file_key)){
            case(?ase) {
                return #ok(_assetExt(ase, true));
            };
            case(null) {};
        };
        switch(_inspectsize(put.chunk.data)){
            case(#ok(size)){ _upload(put.file_key, put.file_name, put.chunk, put.chunk_number, put.file_extension, put.order, size) };
            case(#err(info)){ #err(info) }
        }
    };

    public shared({caller}) func deletekey(file_key : Text) : async Result.Result<Bool, Text> {
        switch(_delete(file_key)) {
            case(#ok(flag)) { #ok(flag) };
            case(#err(info)) { #err(info) };
        }
    };

    public shared({caller}) func deletename(file_name : Text) : async Result.Result<Bool, Text> {
        switch(namemap.get(file_name)) {
            case(null) { #err("don't find file") };
            case(?key) {
                switch(_delete(key)) {
                    case(#ok(flag)) { #ok(flag) };
                    case(#err(info)) { #err(info) };
                }
            };
        }
    };

    public shared({caller}) func clearall() : async Result.Result<Bool, Text> {
        //权限判断OK才执行
        _clear();
        #ok(true)
    };

    // 用户调用bucket获取所存文件信息
    public query({caller}) func getAssetExts() : async Result.Result<[AssetExt], Text>{
        switch(_getAssetExts()) {
            case(#ok(aseexts)) { #ok(aseexts) };
            case(#err(info)) { #err(info) };
        }
    };

    public query({caller}) func getAssetExtkey(file_key : Text) : async Result.Result<AssetExt, Text>{
        switch(_getAssetExtkey(file_key)) {
            case(#ok(aseext)) { #ok(aseext) };
            case(#err(info)) { #err(info) };
        }
    };

    public query({caller}) func getAssetExtFilename(file_name : Text) : async Result.Result<AssetExt, Text>{
        switch(_getAssetExtFilename(file_name)) {
            case(#ok(aseext)) { #ok(aseext) };
            case(#err(info)) { #err(info) };
        }
    };

    // data : [flag, offset + size - 1]
    public query({caller}) func get(
        g : GET
    ) : async Result.Result<[Blob], Text>{
        switch(assets.get(g.file_key)){
            case(null){ #err("wrong file_key") };
            case(?asset){
                // 安全检测
                if(g.flag > asset.page_field.size()){
                    #err("wrong flag")
                }else{
                    Debug.print("page field : " # debug_show(asset.page_field));
                    let field = asset.page_field[g.flag];
                    Debug.print("bucket get field : " # debug_show(field));
                    #ok(_getSM(field))
                }
            };
        }
    };

    public shared({caller}) func preUpgrade() : async() {
        SM.storeNat32(0, Nat32.fromNat(offset));
    };

    public shared({caller}) func postUpgrade() : async() {
        offset := Nat32.toNat(SM.loadNat32(0));
    };

    public shared({caller}) func setBufferCanister(p : Text) : async (){
        buffer_canister_id := p;
    };

    public shared({caller}) func wallet_receive() : async Nat {
        Cycles.accept(Cycles.available())
    };

    public query({caller}) func canisterState() : async State {
        {
            heapSize = Prim.rts_heap_size();
            memorySize = Prim.rts_memory_size();
            balance = Cycles.balance();
        }
    };

    public query({caller}) func cycle_balance() : async Nat {
        Cycles.balance()
    };

    public query({caller}) func avlSM() : async Nat {
        _avlSM()
    };
};
