import Container "/Container";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Types "/Module/Types";
import Cycles "mo:base/ExperimentalCycles";
actor{
    private let limit = 20_000_000_000_000;
    public func wallet_receive() : async Nat{
        let available = Cycles.available();
        let accepted = Cycles.accept(Nat.min(available, limit));
        accepted
    };
    
    public func test() : async(){
        Cycles.add(1_000_000_000_000);
        let container = await Container.Container();
        let bucket_1 = await container.newBucket();
        Debug.print("创建了一个新的bucket, principal为:" # Principal.toText(bucket_1));
        switch(await container.avalBucket(65564)){
            case(#ok(bucketInfo_)){
                let avalBucket_1 = bucketInfo_;
                Debug.print("查询内存大于65564的可用bucket: ");
                Debug.print("总可用内存为:" # Nat.toText(avalBucket_1.avalMemory));
                Debug.print("cycles余额为:" # Nat.toText(avalBucket_1.cycle_balance));
            };
            case(#err(text_))Debug.print(text_);
        };   
    }
}