import type { Principal } from '@dfinity/principal';
export interface AssetExt {
  'file_extension' : FileExtension,
  'upload_status' : boolean,
  'bucket_id' : Principal,
  'file_name' : string,
  'file_key' : string,
  'total_size' : bigint,
  'need_query_times' : bigint,
}
export interface Bucket {
  'avlSM' : () => Promise<bigint>,
  'canisterState' : () => Promise<State>,
  'clearall' : () => Promise<Result_3>,
  'cycle_balance' : () => Promise<bigint>,
  'deletekey' : (arg_0: string) => Promise<Result_3>,
  'deletename' : (arg_0: string) => Promise<Result_3>,
  'get' : (arg_0: GET) => Promise<Result_2>,
  'getAssetExtFilename' : (arg_0: string) => Promise<Result>,
  'getAssetExtkey' : (arg_0: string) => Promise<Result>,
  'getAssetExts' : () => Promise<Result_1>,
  'postUpgrade' : () => Promise<undefined>,
  'preUpgrade' : () => Promise<undefined>,
  'put' : (arg_0: PUT) => Promise<Result>,
  'setBufferCanister' : (arg_0: string) => Promise<undefined>,
  'wallet_receive' : () => Promise<bigint>,
}
export interface Chunk { 'data' : Array<number>, 'digest' : Array<number> }
export type FileExtension = { 'aac' : null } |
  { 'avi' : null } |
  { 'doc' : null } |
  { 'gif' : null } |
  { 'jpg' : null } |
  { 'mp3' : null } |
  { 'mp4' : null } |
  { 'png' : null } |
  { 'ppt' : null } |
  { 'svg' : null } |
  { 'txt' : null } |
  { 'wav' : null } |
  { 'docs' : null } |
  { 'jpeg' : null };
export interface GET { 'flag' : bigint, 'file_key' : string }
export interface PUT {
  'file_extension' : FileExtension,
  'order' : bigint,
  'chunk_number' : bigint,
  'chunk' : Chunk,
  'file_name' : string,
  'file_key' : string,
}
export type Result = { 'ok' : AssetExt } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<AssetExt> } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<Array<number>> } |
  { 'err' : string };
export type Result_3 = { 'ok' : boolean } |
  { 'err' : string };
export interface State {
  'heapSize' : bigint,
  'balance' : bigint,
  'memorySize' : bigint,
}
export interface _SERVICE extends Bucket {}
