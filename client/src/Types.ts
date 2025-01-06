export type RequestFail = {
    success: false
    message: string
}

export type PostsReponseSuccess = {
    success: true
    posts: {
        total: number
        documents: [
            PostResponseSuccess["post"]
        ]
    }
}

export type PostResponseSuccess = {
    success: true,
    post: {
        title: string,
        short_description: string,
        long_description: string,
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
        author_name: string,
    }
    
}

export type CategoryProps = {
    name: string
    subcategories: number
    posts: number
    ctype: number // 0 = category, 1 = subcategory
    category?: string
}

export type CategoriesResponseSuccess = {
    success: true,
    categories: [{
        name: string,
        $id: string,
        $createdAt: string,
        $updatedAt: string,
        $permissions: [],
        $databaseId: string,
        $collectionId: string,
        subcategoriesCount: number,
        postsCount: number
    }]
}

export type SubcategoriesResponseSuccess = {
    success: true,
    subcategories: {
        documents: [
            {
                name: string,
                category: string,
                $id: string,
                $createdAt: string,
                $updatedAt: string,
                $permissions: [],
                $databaseId: string,
                $collectionId: string,
                subcategoriesCount: number,
                postsCount: number
            }
        ]
    }
}

export type PostProps = {
    title: string,
    short_description: string,
    tags: Array<string>,
    post_category: string,
    author_name: string,
    post_date: string,
    id: string,
    onPostPage: boolean | false
    approved: boolean,
    session?: string
}