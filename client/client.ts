import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftMarketplace } from "./target/types/nft_marketplace";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import type { NftMarketplace } from "../target/types/nft_marketplace";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.NftMarketplace as anchor.Program<NftMarketplace>;


async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NftMarketplace as Program<NftMarketplace>;

  const owner = provider.wallet;
  const nftMint = Keypair.generate();
  const listing = Keypair.generate();

  // Listar NFT
  await program.methods
    .listNft(new anchor.BN(500_000_000)) // 0.5 SOL
    .accounts({
      owner: owner.publicKey,
      nftMint: nftMint.publicKey,
      listing: listing.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([listing])
    .rpc();

  console.log("NFT listado en:", listing.publicKey.toBase58());
}

main().catch(err => {
  console.error(err);
})