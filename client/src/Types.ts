export type RequestFail = {
    success: false
    message: string
}

export type PostsReponseSuccess = {
    success: true
    posts: {
        total: number
        documents: [
            {
                title: string,
                short_description: string,
                comments_enabled: boolean,
                tags: Array<string>,
                discord_contact: string,
                portfolio_link: string,
                payment: number,
                post_category: string,
                subcategory: string,
                approved: boolean,
                likes: [string]|[],
                $id: string,
                $createdAt: string,
                $updatedAt: string,
                $permissions: [],
                $databaseId: string,
                $collectionId: string
            }
        ]
    }
}

export type CategoryProps = {
    name: string
    subcategories: number
    posts: number
    ctype: number // 0 = category, 1 = subcategory
    category?: string
}