import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Hex "../../Module/Hex";
import Interface "../../Module/Interface";
import Nat "mo:base/Nat";
import Prim "mo:⛔";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import SHA256 "../../Module/SHA256";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";
import Types "../../Module/Types";

actor Bucket{
    private type AssetExt = Types.AssetExt;
    private type Chunk = Types.Chunk;
    private type PUT = Types.PUT;
    private type GET = Types.GET;
    private type Container = Interface.Container_;
    private type Extension = Types.FileExtension;
    private let THRESHOLD = 2147483648; //2GB
    private let MAX_UPDATE_SIZE = 1992295;
    private let MAX_QUERY_SIZE = 3144728; // 3M - 1KB
    private let UPGRADE_SLICE = 6000; // 暂定
    private let cycle_limit = 2_000_000_000_000;
    private let ic = actor "aaaaa-aa" : Interface.ICActor;
    private var heap_assets = TrieMap.TrieMap<Text, HeapAsset>(Text.equal, Text.hash);
    private var heap_buffers = TrieMap.TrieMap<Text, HeapBuffer>(Text.equal, Text.hash);  

    private type HeapAsset = {
        filename : Text;
        key : Text;
        data : [var Blob];
        total_size : Nat;
        file_extension : Extension;
    };

    private type HeapBuffer = {
        filename : Text;
        key : Text;
        data : [var Blob];
        var total_size : Nat;
        file_extension : Extension;

        digest : [var Nat8];
        chunk_number : Nat;
        var received : Nat;
    };

    private func _avlNSM() : Nat{
        THRESHOLD - Prim.rts_memory_size()
    };

    private func _inspect(data : Blob) : Result.Result<Nat, Text>{
        var size = data.size();
        if(size <= _avlNSM()){
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

    private func _assetExt(asset : HeapAsset) : AssetExt{
        {
            filename = asset.filename;
            bucket_id = Principal.fromActor(Bucket);
            key = asset.key;
            total_size = asset.total_size;
            file_extension = asset.file_extension;
            need_query_times = asset.data.size();
        }
    };
    
    private func _key(digests : [Nat8]) : Text{
        Hex.encode(SHA256.sha256(digests))
    };

    private func _init(filename : Text, chunk : Chunk, chunk_num : Nat, extension : Extension) : async Result.Result<AssetExt, Text> {
        var size_ = 0;
        switch(_inspect(chunk.data)){
            case(#ok(size)){ size_ := size; };
            case(#err(e)){ return #err(e) };
        };

        let key = _key(chunk.digest);
        if(chunk_num == 0){
            #err("wrong chunk num value 0")
        }else if(chunk_num == 1){
            var data_ = Array.init<Blob>(chunk_num, "");
            data_[0] := chunk.data;
            let heap_asset = {
                filename = filename;
                key = key;
                data = data_;
                total_size = size_;
                file_extension = extension;
            };
            heap_assets.put(key, heap_asset);
            #ok(_assetExt(heap_asset))
        }else{
            var data_ = Array.init<Blob>(chunk_num, "");
            data_[0] := chunk.data;         
            var digest_ = Array.init<Nat8>(chunk_num*32, 0);
            _digest(digest_, chunk.digest, 0);   

            let buffer_asset = {
                filename = filename;
                key = key;
                data = data_;
                var total_size = size_;
                file_extension = extension;

                digest = digest_;
                chunk_number = chunk_num;
                var received = 1;
            };

            heap_buffers.put(key, buffer_asset);
            #ok(_assetExt(
                {
                    filename = filename;
                    key = key;
                    data = data_;
                    total_size = size_;
                    file_extension = extension;
                }
            ))
        }
    };

    private func _append(key : Text, chunk : Chunk, order : Nat) : async Result.Result<AssetExt, Text> {
        var size_ = 0;
        if(order < 1){ return #err("wrong order") };
        switch(_inspect(chunk.data)){
            case(#ok(size)){ size_ := size; };
            case(#err(e)){ return #err(e) };
        };

        switch(heap_buffers.get(key)){
            case null { #err("file didn't initralize") };
            case (?heap_buffer){
                if(heap_buffer.received + 1 == heap_buffer.chunk_number){
                    _digest(heap_buffer.digest, chunk.digest, heap_buffer.received);
                    heap_buffer.received += 1;
                    heap_buffer.data[order] := chunk.data;
    
                    let total_size_ = heap_buffer.total_size + size_;
                    let digests_ = Array.freeze(heap_buffer.digest);
                    let key_ = _key(digests_);
                    let heap_asset = {
                        filename = heap_buffer.filename;
                        key = key_;
                        data = heap_buffer.data;
                        total_size = total_size_;
                        file_extension = heap_buffer.file_extension;
                    };

                    heap_assets.put(key_, heap_asset);
                    heap_buffers.delete(heap_buffer.key);
                    Debug.print("final heap asset" # debug_show(heap_asset));
                    #ok(_assetExt(heap_asset))
                }else{
                    _digest(heap_buffer.digest, chunk.digest, heap_buffer.received);
                    heap_buffer.received += 1;
                    heap_buffer.data[order] := chunk.data;
                    heap_buffer.total_size += size_; 
                    #ok(_assetExt(
                        {
                            filename = heap_buffer.filename;
                            key = heap_buffer.key;
                            data = heap_buffer.data;
                            total_size = heap_buffer.total_size;
                            file_extension = heap_buffer.file_extension;
                        }
                    ))
                }
            }
        }
    };

    public shared({caller}) func put(put : PUT) : async Result.Result<AssetExt, Text>{
        switch(put){
            case(#init(segment)){
                switch(_inspect(segment.chunk.data)){
                    case(#ok(_)){await _init(segment.filename, segment.chunk, segment.chunk_number, segment.file_extension) };
                    case(#err(info)){ #err(info) }
                }
            };
            case(#append(segment)){
                switch(_inspect(segment.chunk.data)){
                    case(#ok(_)){await _append(segment.key, segment.chunk, segment.order) };
                    case(#err(info)){ #err(info) }
                }
            };
        }
    };

    public query({caller}) func get(g : GET) : async Result.Result<[Blob], Text>{
        switch(heap_assets.get(g.key)){
            case(null){ #err("wrong key") };
            case(?heap_asset){
                if(g.flag > heap_asset.data.size()){
                    #err("wrong flag")
                }else{
                    let data : [var Blob] = heap_asset.data;
                    let data_ = Array.freeze(data);
                    #ok(data_)
                }
            };
        }
    }; 
    
    public query({caller}) func getAssetExt(key : Text) : async Result.Result<AssetExt, Text>{
        switch(heap_assets.get(key)){
            case null { #err("wrong key") };
            case(?heap_asset){ #ok(_assetExt(heap_asset)) };
        }
    };

    public query({caller}) func getBalance() : async Nat{
        Cycles.balance()
    };

    public query({caller}) func getMemory() : async Nat{
        Prim.rts_memory_size() 
    };

    public shared({caller}) func wallet_receive() : async Nat {
        let available = Cycles.available();
        let accepted = Cycles.accept(Nat.min(available, cycle_limit));
        accepted
    };
}
