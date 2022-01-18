module{

    // Container
    public type CallBack = {
        //cycle_balance : Nat;
        avl_memory : Nat;
    };

    // data 设为1.9 M (1992295) / chunk
    public type Chunk = {
        digest : [Nat8];
        data : Blob;
    };
    
    public type AssetExt = {
        bucket_id : Principal;
        file_key : Text;
        file_name : Text;
        file_extension : FileExtension;
        total_size : Nat;
        upload_status : Bool;
        need_query_times : Nat; // need query times for one file
    };

    /**
    *   wasm page 暂时做成连续存储， 即只增不删
    */
    public type Asset = {
        file_name : Text;
        file_key :  Text; // Key = SHA256(chunk file_key)
        page_field : [[(Nat, Nat)]]; // (offset, size)->3M/slice
        total_size : Nat; // file total size
        file_extension : FileExtension;
    };

    public type BufferAsset = {
        digest : [var Nat8]; // Chunk SHA256 Digest Array [a] + [b] -> [a,b], 这个不保存
        chunk_number : Nat;
        var page_field : [var (Nat, Nat)]; // (offset, size)->3M/slice
        var total_size : Nat; // file total size
        var received : Nat; // received put
    };

    public type PUT = {
        file_key : Text;
        file_name : Text;
        file_extension : FileExtension;
        chunk : Chunk;
        chunk_number : Nat;
        order : Nat;
    };

    public type State = {
        heapSize : Nat;
        memorySize : Nat;
        balance : Nat;
    };

    public type GET = {
        file_key : Text;
        // 在一次请求中， 第几次请求这个文件
        // 如果接着上次的请求， flag 取值区间为 [0, need_query_size - 1]
        // 若只需要query一次， 那么flag填0即可
        // 如果要重新开始请求， 就从1开始。
        flag : Nat;
    };

    public type FileExtension = {
        #txt;
        #docs;
        #doc;
        #ppt;
        #jpeg;
        #jpg;
        #png;
        #gif;
        #svg;
        #mp3;
        #wav;
        #aac;
        #mp4;
        #avi;
    };
};