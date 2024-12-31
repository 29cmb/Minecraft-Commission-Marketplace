export type PostData = {
    title: string,
    short_description: string,
    long_description: string,
    comments_enabled: boolean,
    tags: Array<String>,
    discord_contact: string,
    portfolio_link: string,
    payment: number,
    post_category: string,
    subcategory: string,
    author: string,
    approved?: boolean
}