export const idlFactory = ({ IDL }) => {
  const State = IDL.Record({
    'heapSize' : IDL.Nat,
    'balance' : IDL.Nat,
    'memorySize' : IDL.Nat,
  });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
  const GET = IDL.Record({ 'flag' : IDL.Nat, 'file_key' : IDL.Text });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Vec(IDL.Nat8)),
    'err' : IDL.Text,
  });
  const FileExtension = IDL.Variant({
    'aac' : IDL.Null,
    'avi' : IDL.Null,
    'doc' : IDL.Null,
    'gif' : IDL.Null,
    'jpg' : IDL.Null,
    'mp3' : IDL.Null,
    'mp4' : IDL.Null,
    'png' : IDL.Null,
    'ppt' : IDL.Null,
    'svg' : IDL.Null,
    'txt' : IDL.Null,
    'wav' : IDL.Null,
    'docs' : IDL.Null,
    'jpeg' : IDL.Null,
  });
  const AssetExt = IDL.Record({
    'file_extension' : FileExtension,
    'upload_status' : IDL.Bool,
    'bucket_id' : IDL.Principal,
    'file_name' : IDL.Text,
    'file_key' : IDL.Text,
    'total_size' : IDL.Nat,
    'need_query_times' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : AssetExt, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(AssetExt), 'err' : IDL.Text });
  const Chunk = IDL.Record({
    'data' : IDL.Vec(IDL.Nat8),
    'digest' : IDL.Vec(IDL.Nat8),
  });
  const PUT = IDL.Record({
    'file_extension' : FileExtension,
    'order' : IDL.Nat,
    'chunk_number' : IDL.Nat,
    'chunk' : Chunk,
    'file_name' : IDL.Text,
    'file_key' : IDL.Text,
  });
  const Bucket = IDL.Service({
    'avlSM' : IDL.Func([], [IDL.Nat], ['query']),
    'canisterState' : IDL.Func([], [State], ['query']),
    'clearall' : IDL.Func([], [Result_3], []),
    'cycle_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'deletekey' : IDL.Func([IDL.Text], [Result_3], []),
    'deletename' : IDL.Func([IDL.Text], [Result_3], []),
    'get' : IDL.Func([GET], [Result_2], ['query']),
    'getAssetExtFilename' : IDL.Func([IDL.Text], [Result], ['query']),
    'getAssetExtkey' : IDL.Func([IDL.Text], [Result], ['query']),
    'getAssetExts' : IDL.Func([], [Result_1], ['query']),
    'postUpgrade' : IDL.Func([], [], []),
    'preUpgrade' : IDL.Func([], [], []),
    'put' : IDL.Func([PUT], [Result], []),
    'setBufferCanister' : IDL.Func([IDL.Text], [], []),
    'wallet_receive' : IDL.Func([], [IDL.Nat], []),
  });
  return Bucket;
};
export const init = ({ IDL }) => { return []; };
