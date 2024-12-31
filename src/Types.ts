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
    approved?: boolean,
    created?: Date,
    likes?: [] | [string]
}

export type CommentData = {
    post_id: string,
    created?: Date,
    content: string,
    author: string
}