use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWxqSWYjv7zFh7z8xZp3xYwFh7zF");

#[program]
pub mod nft_marketplace {
    use super::*;

    pub fn list_nft(ctx: Context<ListNFT>, price: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.owner = *ctx.accounts.owner.key;
        listing.nft_mint = *ctx.accounts.nft_mint.to_account_info().key;
        listing.price = price;
        listing.is_active = true;
        Ok(())
    }

    pub fn buy_nft(ctx: Context<BuyNFT>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.is_active, CustomError::ListingInactive);

        // Transfer SOL from buyer to seller
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? -= listing.price;
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? += listing.price;

        // Transfer NFT from seller to buyer
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_nft_account.to_account_info(),
                to: ctx.accounts.buyer_nft_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, 1)?;

        listing.is_active = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ListNFT<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub nft_mint: AccountInfo<'info>,
    #[account(init, payer = owner, space = 8 + 32 + 32 + 8 + 1)]
    pub listing: Account<'info, Listing>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyNFT<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    #[account(mut)]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub seller_nft_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_nft_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Listing {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub price: u64,
    pub is_active: bool,
}

#[error_code]
pub enum CustomError {
    #[msg("Listing is not active")]
    ListingInactive,
}
