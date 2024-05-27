use anchor_lang::prelude::*;

declare_id!("HcSE67qhX4W4bAhebZmQkDiPjvqKdQQMyYKZr3c3jsKG");

#[program]
pub mod solana_linkedin {
    use super::*;

    pub fn create_post(ctx: Context<CreatePost>, content: String) -> Result<()> {
        let post = &mut ctx.accounts.post;
        post.authority = *ctx.accounts.authority.key;
        post.content = content;
        Ok(())
    }

    pub fn comment_on_post(
        ctx: Context<CommentOnPost>,
        post_id: Pubkey,
        content: String,
    ) -> Result<()> {
        let comment = &mut ctx.accounts.comment;
        comment.authority = *ctx.accounts.authority.key;
        comment.post_id = post_id;
        comment.content = content;
        Ok(())
    }

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.has_topweb3_nft = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 280)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommentOnPost<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 280)]
    pub comment: Account<'info, Comment>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Profile {
    pub authority: Pubkey,
    pub has_topweb3_nft: bool,
}

#[account]
pub struct Post {
    pub authority: Pubkey,
    pub content: String,
}

#[account]
pub struct Comment {
    pub authority: Pubkey,
    pub post_id: Pubkey,
    pub content: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("NFT is required to perform this action")]
    NftRequired,
}
