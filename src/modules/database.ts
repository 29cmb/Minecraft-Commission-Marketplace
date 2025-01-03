import { Client, Databases, ID, Account, Query, Users, Models } from 'node-appwrite';
import { CommentData, DocumentPostData, PostData } from '../Types';

const endpoint: string = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const project: string = process.env.APPWRITE_PROJECT || "";
const key: string = process.env.APPWRITE_API_KEY || "";

const databaseID: string = process.env.APPWRITE_DATABASE_ID || "";
const usernamesCollection: string = process.env.APPWRITE_USERNAMES_COLLECTION_ID || "";
const categoriesCollection: string = process.env.APPWRITE_CATEGORIES_COLLECTION_ID || "";
const subcategoriesCollection: string = process.env.APPWRITE_SUBCATEGORIES_COLLECTION_ID || "";
const postsCollection: string = process.env.APPWRITE_POSTS_COLLECTION_ID || "";
const commentsCollection: string = process.env.APPWRITE_COMMENTS_COLLECTION_ID || "";

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(key);

const databases = new Databases(client);
const accounts = new Account(client);
const users = new Users(client);

const signup = async (email: string, username: string, password: string) => {
    return accounts.create(ID.unique(), email, password)
    .then(() => {
        return databases.createDocument(
            databaseID,
            usernamesCollection,
            ID.unique(),
            {
                email,
                username
            }
        )
    })
}

const login = async (username: string, password: string) => {
    return databases.listDocuments(databaseID, usernamesCollection, [
        Query.equal("username", username)
    ]).then((response) => {
        const user = response.documents[0];
        return accounts.createEmailPasswordSession(user.email, password)
    })
}

const getCategories = async () => {
    const categoriesResponse = await databases.listDocuments(databaseID, categoriesCollection);
    const categories = categoriesResponse.documents;

    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
        const subcategoriesResponse = await databases.listDocuments(databaseID, subcategoriesCollection, [
            Query.equal("category", category.name)
        ]);
        const subcategories = subcategoriesResponse.documents;

        const postsCount = await Promise.all(subcategories.map(async (subcategory) => {
            const postsResponse = await databases.listDocuments(databaseID, postsCollection, [
                Query.equal("subcategory", subcategory.name)
            ]);
            return postsResponse.total;
        }));

        const totalPosts = postsCount.reduce((acc, count) => acc + count, 0);

        return {
            ...category,
            subcategoriesCount: subcategories.length,
            postsCount: totalPosts
        };
    }));

    return categoriesWithCounts;
}


const getSubcategories = () => {
    return databases.listDocuments(databaseID, subcategoriesCollection);
}

const getPostsInSubcategory = (subcategory: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const postsResponse = await databases.listDocuments(databaseID, postsCollection, [
                Query.equal("subcategory", subcategory)
            ]);

            const posts: DocumentPostData[] = postsResponse.documents as unknown as DocumentPostData[];

            const promises = posts.map(async (post: DocumentPostData) => {
                if(post.approved === false) {
                    return null;
                }

                const author = post.author;
                if (author == null) {
                    post.author_name = "Unknown";
                    return post;
                }

                const user = await users.get(author);

                const userResponse = await databases.listDocuments(databaseID, usernamesCollection, [
                    Query.equal("email", user.email)
                ]);

                if (userResponse.documents.length > 0) {
                    post.author_name = userResponse.documents[0].username;
                } else {
                    post.author_name = "Unknown";
                }

                return post;
            });

            const updatedPosts = (await Promise.all(promises)).filter(post => post !== null);

            resolve({
                total: updatedPosts.length,
                documents: updatedPosts
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getUser: 
    (secret: string) => Promise<Models.User<Models.Preferences>> = (secret: string) => {
    const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
    const clientAccounts = new Account(client);
    return clientAccounts.get()
}

const postToQueue = (data: PostData) => {
    const newData: PostData = {
        ...data,
        approved: false,
        likes: []
    }

    return databases.createDocument(
        databaseID,
        postsCollection,
        ID.unique(),
        newData
    )
}

const userExists = async (secret: string) => {
    const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
    const clientAccounts = new Account(client);
    return clientAccounts.get().then(() => {
        return true;
    }).catch(() => {
        return false;
    })
}

const isStaff = async (secret: string) => {
    const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
    const clientAccounts = new Account(client);
    return clientAccounts.get().then((response) => {
        return response.labels.includes("admin");
    }).catch(() => {
        return false;
    })
}

const getReviewQueue = () => {
    return databases.listDocuments(databaseID, postsCollection, [
        Query.equal("approved", false)
    ]);
}

const setApproved = (id: string, approved: boolean) => {
    return databases.updateDocument(databaseID, postsCollection, id, {
        approved
    })
}

const createRecovery = (email: string) => {
    // TODO: Reset password in the client
    return accounts.createRecovery(email, `${process.env.CLIENT_URL}/reset-password`);
}

const updateRecovery = (uid: string, secret: string, password: string) => {
    return accounts.updateRecovery(uid, secret, password);
}

const createVerification = (session: string) => {
    const userClient = new Client().setEndpoint(endpoint).setProject(project).setSession(session);
    const userAccounts = new Account(userClient);
    // TODO: Verify email in the client
    return userAccounts.createVerification(`${process.env.CLIENT_URL}/verify-email`);
}

const updateVerification = (uid: string, secret: string, session: string) => {
    const userClient = new Client().setEndpoint(endpoint).setProject(project).setSession(session);
    const userAccounts = new Account(userClient);
    return userAccounts.updateVerification(uid, secret);
}

const getPost: (id: string) => Promise<PostData> = (id: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const post: DocumentPostData = await databases.getDocument(databaseID, postsCollection, id) as unknown as DocumentPostData;

            const author = post.author;
            if (author == null) {
                post.author_name = "Unknown";
                resolve(post);
                return;
            }

            const user = await users.get(author);

            const userResponse = await databases.listDocuments(databaseID, usernamesCollection, [
                Query.equal("email", user.email)
            ]);

            if (userResponse.documents.length > 0) {
                post.author_name = userResponse.documents[0].username;
            } else {
                post.author_name = "Unknown";
            }

            resolve(post as PostData);
        } catch (error) {
            reject(error);
        }
    });
};

const postExists = async (id: string) => {
    return databases.getDocument(databaseID, postsCollection, id).then(() => {
        return true;
    }).catch(() => {
        return false;
    })
}

const updatePost = (id: string, data: PostData) => {
    data.approved = false;
    return databases.updateDocument(databaseID, postsCollection, id, data);
}

const deletePost = async (id: string) => {
    return databases.deleteDocument(databaseID, postsCollection, id).then(() => {
        return databases.listDocuments(databaseID, commentsCollection, [
            Query.equal("post_id", id)
        ]).then((response) => {
            return response.documents.forEach((comment) => {
                return databases.deleteDocument(databaseID, commentsCollection, comment.$id);
            })
        })  
    });
}

const postComment = (comment: CommentData) => {
    return databases.createDocument(
        databaseID,
        commentsCollection,
        ID.unique(),
        comment
    )
}

const getPostComments: (id: string) => Promise<{total: number, documents: CommentData[]}> = (id: string) => {
    return new Promise(async (resolve, reject) => {
        databases.listDocuments(databaseID, commentsCollection, [
            Query.equal("post_id", id)
        ]).then((response) => {
            resolve(response as unknown as {total: number, documents: CommentData[]});
        }).catch((error) => {
            reject(error);
        });
    })
}

const likePost = async (id: string, session: string) => {
    const user = await getUser(session);
    const post: DocumentPostData = await getPost(id) as DocumentPostData;
    const likes: string[] = post.likes || [];

    if (likes.includes(user.$id)) {
        return databases.updateDocument(databaseID, postsCollection, id, {
            likes: likes.filter((like: string) => like !== user.$id)
        });
    } else {
        return databases.updateDocument(databaseID, postsCollection, id, {
            likes: [...likes, user.$id]
        });
    }
}


const getLikes = async (session: string) => {
    return getUser(session).then((user) => {
        return databases.listDocuments(databaseID, postsCollection, [
            Query.contains("likes", [user.$id])
        ])
    })
}

const commentExists = async (id: string) => {
    return databases.getDocument(databaseID, commentsCollection, id).then(() => {
        return true;
    }).catch(() => {
        return false;
    })
}

const getComment = (id: string) => {
    return databases.getDocument(databaseID, commentsCollection, id);
}

const editComment = (id: string, newComment: string) => {
    return databases.updateDocument(databaseID, commentsCollection, id, {
        content: newComment
    });
}

const deleteComment = (id: string) => {
    return databases.deleteDocument(databaseID, commentsCollection, id);
}

const getPostsInCategory = async (category: string) => {
    return databases.listDocuments(databaseID, subcategoriesCollection, [
        Query.equal('category', category)
    ])
    .then((subcategories) => {
        const subcategoryName = subcategories.documents.map((doc) => doc.name);
        return databases.listDocuments(databaseID, postsCollection, [
            Query.contains('subcategory', subcategoryName)
        ]);
    });
}

const categoryExists = async (category: string) => {
    return databases.listDocuments(databaseID, categoriesCollection, [
        Query.equal('name', category)
    ]).then((response) => {
        return response.documents.length > 0;
    });
}

export { 
    signup, 
    login, 
    getCategories, 
    getSubcategories, 
    getPostsInSubcategory, 
    getUser, 
    postToQueue, 
    userExists, 
    isStaff, 
    getReviewQueue, 
    setApproved, 
    createRecovery, 
    updateRecovery,
    createVerification,
    updateVerification,
    getPost,
    postExists,
    updatePost,
    deletePost,
    postComment,
    getPostComments,
    likePost,
    getLikes,
    commentExists,
    getComment,
    editComment,
    deleteComment,
    getPostsInCategory,
    categoryExists
};