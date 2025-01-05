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
    likes?: [] | string[]
    author_name?: string
    comments?: CommentData[]
}

export interface DocumentPostData extends Document, PostData {
    $createdAt: string
}

export type CommentData = {
    post_id: string,
    content: string,
    author: string
}