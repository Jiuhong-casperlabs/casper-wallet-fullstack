prepare:
	rustup target add wasm32-unknown-unknown

build-contract:
	cargo build --release --target wasm32-unknown-unknown
	wasm-strip contract/target/wasm32-unknown-unknown/release/contract.wasm 2>/dev/null | true


clippy:
	cargo clippy --all-targets -- -D warnings

check-lint: clippy
	cargo fmt -- --check

lint: clippy
	cargo fmt

clean:
	cargo clean
