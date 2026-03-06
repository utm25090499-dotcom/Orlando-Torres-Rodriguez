import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftMarketplace } from "../target/types/nft_marketplace";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import type { NftMarketplace } from "../target/types/nft_marketplace";

describe("nft_marketplace", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.NftMarketplace as anchor.Program<NftMarketplace>;
  
  // Configuración del provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NftMarketplace as Program<NftMarketplace>;

  // Cuentas de prueba
  const owner = provider.wallet;
  const buyer = Keypair.generate();
  const nftMint = Keypair.generate();
  const listing = Keypair.generate();

  it("Listar un NFT", async () => {
    await program.methods
      .listNft(new anchor.BN(1_000_000_000)) // precio en lamports (1 SOL)
      .accounts({
        owner: owner.publicKey,
        nftMint: nftMint.publicKey,
        listing: listing.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([listing])
      .rpc();

    const listingAccount = await program.account.listing.fetch(listing.publicKey);
    console.log("Listing creado:", listingAccount);
  });

  it("Comprar un NFT", async () => {
    await program.methods
      .buyNft()
      .accounts({
        buyer: buyer.publicKey,
        seller: owner.publicKey,
        listing: listing.publicKey,
        sellerNftAccount: owner.publicKey, // simplificado para test
        buyerNftAccount: buyer.publicKey,  // simplificado para test
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        owner: owner.publicKey,
      })
      .signers([buyer])
      .rpc();

    const listingAccount = await program.account.listing.fetch(listing.publicKey);
    console.log("Listing después de compra:", listingAccount);
  });
});
