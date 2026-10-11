use anchor_lang::prelude::*;

declare_id!("21zYJkCPghAo7AReNZhbwdQ9VCoFYZ5pCLVxrsKmXP2s");

#[program]
pub mod seeker_onchain {
    use super::*;

    pub fn complete_quest(
        ctx: Context<CompleteQuest>,
        quest_id: String,
    ) -> Result<()> {
        validate_id(&quest_id)?;

        let record = &mut ctx.accounts.quest_record;
        record.wallet = ctx.accounts.user.key();
        record.quest_id = quest_id;
        record.completed_at = Clock::get()?.unix_timestamp;
        record.verified = false;

        msg!("Seeker quest claim recorded on-chain");
        Ok(())
    }

    pub fn record_achievement(
        ctx: Context<RecordAchievement>,
        achievement_id: String,
    ) -> Result<()> {
        validate_id(&achievement_id)?;

        let record = &mut ctx.accounts.achievement_record;
        record.wallet = ctx.accounts.user.key();
        record.achievement_id = achievement_id;
        record.recorded_at = Clock::get()?.unix_timestamp;
        record.verified = false;

        msg!("Seeker achievement claim recorded on-chain");
        Ok(())
    }
}

fn validate_id(id: &str) -> Result<()> {
    require!(
        !id.is_empty() && id.len() <= 32,
        SeekerError::InvalidId
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(quest_id: String)]
pub struct CompleteQuest<'info> {
    #[account(
        init,
        payer = user,
        space = QuestRecord::SPACE,
        seeds = [b"quest", user.key().as_ref(), quest_id.as_bytes()],
        bump
    )]
    pub quest_record: Account<'info, QuestRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(achievement_id: String)]
pub struct RecordAchievement<'info> {
    #[account(
        init,
        payer = user,
        space = AchievementRecord::SPACE,
        seeds = [
            b"achievement",
            user.key().as_ref(),
            achievement_id.as_bytes()
        ],
        bump
    )]
    pub achievement_record: Account<'info, AchievementRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct QuestRecord {
    pub wallet: Pubkey,
    pub quest_id: String,
    pub completed_at: i64,
    pub verified: bool,
}

impl QuestRecord {
    pub const SPACE: usize = 8 + 32 + 4 + 32 + 8 + 1;
}

#[account]
pub struct AchievementRecord {
    pub wallet: Pubkey,
    pub achievement_id: String,
    pub recorded_at: i64,
    pub verified: bool,
}

impl AchievementRecord {
    pub const SPACE: usize = 8 + 32 + 4 + 32 + 8 + 1;
}

#[error_code]
pub enum SeekerError {
    #[msg("ID must contain between 1 and 32 bytes.")]
    InvalidId,
}
