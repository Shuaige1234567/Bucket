import Types "../../Module/Types";
import SHA256 "../../Module/SHA256";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Cycles "mo:base/ExperimentalCycles";
import nsmbucket "canister:nsmbucket";

actor nsmBucketTest{
    let metadata = Array.freeze(Array.init<Nat8>(1000, 0xff));
    let blob = Blob.fromArray(metadata);
    let chunk_number = 100;
    var key = "";
    var order = 1;
    var times = 0;
    let file_extension = #png;

    let chunk = {
        digest = SHA256.sha256(metadata);
        data = blob;
    };

    let init_chunk = {
        filename = "1";
        chunk = chunk;
        chunk_number = chunk_number;
        file_extension = #png;
    };

    public shared({caller}) func test_init() : async (){
        switch(await nsmbucket.put(#init(init_chunk))){
            case (#err(_)){ Debug.print("init error") };
            case (#ok(a)){
                key := a.key;
                Debug.print("key : " # key);
                Debug.print("init total size : " # debug_show(a.total_size));
                Debug.print("need query times : " # debug_show(a.need_query_times))
            };
        }
    };

    // 99 times
    public shared({caller}) func test_append() : async (){
        let test_append = {
            chunk = chunk;
            key = key;
            order = order;
        };
        order := order + 1;
        switch(await nsmbucket.put(#append(test_append))){
            case (#err(_)){ Debug.print("append error") };
            case (#ok(a)){
                Debug.print("key : " # key);
                Debug.print("append total size : " # debug_show(a.total_size));
                Debug.print("need query times : " # debug_show(a.need_query_times));
                key := a.key;
                times := a.need_query_times;
            };
        }
    };

    public shared({caller}) func test_get() : async (){
        var i = 0;
        label l loop{
            if(i == times){
                Debug.print("get end");
                break l;
            };
            switch(await nsmbucket.get({key = key; flag = i})){
                case(#err(_)){ Debug.print("get error") };
                case(#ok(b)){
                    Debug.print("asset array size : " # debug_show(b.size()));
                    var return_size = 0;
                    for(s in b.vals()){
                        return_size += s.size();
                    };
                    Debug.print(debug_show(return_size));
                    Debug.print("Asset Slice Data : "# debug_show(b));
                };
            };
            i := i + 1;
        }
    };
};
