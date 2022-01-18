#!/bin/bash
dfx stop
dfx start --background --clean --emulator
dfx deploy
dfx canister call test test_init
dfx canister call test test_get
for i in `seq 99`
do
    dfx canister call test test_append
done
dfx canister call test test_get