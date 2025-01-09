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
    try {
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
    } catch (e) {
        return Promise.reject(e);
    }
}

const login = async (username: string, password: string) => {
    try {
        return databases.listDocuments(databaseID, usernamesCollection, [
            Query.equal("username", username)
        ]).then((response) => {
            const user = response.documents[0];
            return accounts.createEmailPasswordSession(user.email, password)
        })
    } catch(e) {
        return Promise.reject(e);
    }
}

const getCategories = async () => {
    try {
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
    } catch(e){
        return Promise.reject(e);
    }
}


const getSubcategories = () => {
    try {
        return databases.listDocuments(databaseID, subcategoriesCollection);
    } catch(e){
        return Promise.reject(e);
    }
}

const getPostsInSubcategory = (subcategory: string, page: number, auth: string | undefined) => {
    const limit = 10;
    return new Promise(async (resolve, reject) => {
        try {
            const offset = (page - 1) * limit;

            const postsResponse = await databases.listDocuments(databaseID, postsCollection, [
                Query.equal("subcategory", subcategory),
                Query.limit(limit),
                Query.offset(offset)
            ]);

            let posts: DocumentPostData[] = postsResponse.documents as unknown as DocumentPostData[];

            let staffUser: Client | undefined;
            if(auth && await isStaff(auth)) {
                staffUser = new Client().setEndpoint(endpoint).setProject(project).setSession(auth);
            }

            const promises = posts.map(async (post: DocumentPostData) => {
                if (post.approved === false && (staffUser == undefined)) {
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

            let updatedPosts = (await Promise.all(promises)).filter(post => post !== null);

            updatedPosts = updatedPosts.sort((a, b) => {
                if (a.post_category === 'announcement' && b.post_category !== 'announcement') {
                    return -1;
                }
                if (a.post_category !== 'announcement' && b.post_category === 'announcement') {
                    return 1;
                }

                return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
            });

            resolve({
                total: postsResponse.total,
                documents: updatedPosts
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getUser: 
    (secret: string) => Promise<Models.User<Models.Preferences>> = (secret: string) => {
        try {
            const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
            const clientAccounts = new Account(client);
            return clientAccounts.get()
        } catch(e){
            return Promise.reject(e);
        }
}

const postToQueue = (data: PostData, isStaff: boolean) => {
    try {
        const newData: PostData = {
            ...data,
            approved: isStaff,
            likes: []
        }
    
        return databases.createDocument(
            databaseID,
            postsCollection,
            ID.unique(),
            newData
        )
    } catch(e) {
        return Promise.reject(e);
    }
}

const userExists = async (secret: string) => {
    try {
        const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
        const clientAccounts = new Account(client);
        return clientAccounts.get().then(() => {
            return true;
        }).catch(() => {
            return false;
        })
    } catch(e){
        return Promise.reject(e);
    }
}

const isStaff = async (secret: string) => {
    try {
        const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
        const clientAccounts = new Account(client);
        return clientAccounts.get().then((response) => {
            return response.labels.includes("admin");
        }).catch(() => {
            return false;
        })
    } catch(e){
        return Promise.reject(e);
    }
}

const getReviewQueue = () => {
    try {
        return databases.listDocuments(databaseID, postsCollection, [
            Query.equal("approved", false)
        ]);
    } catch(e){
        return Promise.reject(e);
    }
}

const setApproved = (id: string, approved: boolean) => {
    try {
        return databases.updateDocument(databaseID, postsCollection, id, {
            approved
        })
    } catch(e){
        return Promise.reject(e)
    }
}

const createRecovery = (email: string) => {
    // TODO: Reset password in the client
    try {
        return accounts.createRecovery(email, `${process.env.CLIENT_URL}/reset-password`);
    } catch(e) {
        return Promise.reject(e);
    }
}

const updateRecovery = (uid: string, secret: string, password: string) => {
    try {
        return accounts.updateRecovery(uid, secret, password);
    } catch(e) {
        return Promise.reject(e);
    }
}

const createVerification = (session: string) => {
    try {
        const userClient = new Client().setEndpoint(endpoint).setProject(project).setSession(session);
        const userAccounts = new Account(userClient);
        // TODO: Verify email in the client
        return userAccounts.createVerification(`${process.env.CLIENT_URL}/verify-email`);
    } catch(e) {
        return Promise.reject(e);
    }
}

const updateVerification = (uid: string, secret: string, session: string) => {
    try {
        const userClient = new Client().setEndpoint(endpoint).setProject(project).setSession(session);
        const userAccounts = new Account(userClient);
        return userAccounts.updateVerification(uid, secret);
    } catch(e){
        return Promise.reject(e)
    }
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
    try {
        return databases.getDocument(databaseID, postsCollection, id).then(() => {
            return true;
        }).catch(() => {
            return false;
        })
    } catch(e) {
        return Promise.reject(e);
    }
}

const updatePost = (id: string, data: PostData) => {
    try {
        data.approved = false;
        return databases.updateDocument(databaseID, postsCollection, id, data);
    } catch(e) {
        return Promise.reject(e);
    }
}

const deletePost = async (id: string) => {
    try {
        return databases.deleteDocument(databaseID, postsCollection, id).then(() => {
            return databases.listDocuments(databaseID, commentsCollection, [
                Query.equal("post_id", id)
            ]).then((response) => {
                return response.documents.forEach((comment) => {
                    return databases.deleteDocument(databaseID, commentsCollection, comment.$id);
                })
            })  
        });
    } catch(e) {
        return Promise.reject(e);
    }
}

const postComment = (comment: CommentData) => {
    try {
        return databases.createDocument(
            databaseID,
            commentsCollection,
            ID.unique(),
            comment
        )
    } catch(e) {
        return Promise.reject(e);
    }
}

const getPostComments: (id: string) => Promise<{total: number, documents: CommentData[]}> = (id: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            databases.listDocuments(databaseID, commentsCollection, [
                Query.equal("post_id", id)
            ]).then((response) => {
                resolve(response as unknown as {total: number, documents: CommentData[]});
            }).catch((error) => {
                reject(error);
            });
        } catch(e){
            reject(e)
        }
    })
}

const likePost = async (id: string, session: string) => {
    try {
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
    } catch(e) {
        return Promise.reject(e)
    }
}

const getLikes = async (session: string) => {
    try {
        return getUser(session).then((user) => {
            return databases.listDocuments(databaseID, postsCollection, [
                Query.contains("likes", [user.$id])
            ])
        })
    } catch(e){
        return Promise.reject(e)
    }
}

const commentExists = async (id: string) => {
    try {
        return databases.getDocument(databaseID, commentsCollection, id).then(() => {
            return true;
        }).catch(() => {
            return false;
        })
    } catch(e){
        return false
    }
}

const getComment = (id: string) => {
    try {
        return databases.getDocument(databaseID, commentsCollection, id);
    } catch(e) {
        return Promise.reject(e);
    }
}

const editComment = (id: string, newComment: string) => {
    try {
        return databases.updateDocument(databaseID, commentsCollection, id, {
            content: newComment
        });
    } catch(e) {
        return Promise.reject(e)
    }
}

const deleteComment = (id: string) => {
    try {
        return databases.deleteDocument(databaseID, commentsCollection, id);
    } catch(e) {
        return Promise.reject(e)
    }
}

const getPostsInCategory = async (category: string) => {
    try {
        return databases.listDocuments(databaseID, subcategoriesCollection, [
            Query.equal('category', category),
            Query.equal('approved', true)
        ])
        .then((subcategories) => {
            const subcategoryName = subcategories.documents.map((doc) => doc.name);
            return databases.listDocuments(databaseID, postsCollection, [
                Query.contains('subcategory', subcategoryName)
            ]);
        });
    } catch(e) {
        return Promise.reject(e)
    }
}

const categoryExists = async (category: string) => {
    try {
        return databases.listDocuments(databaseID, categoriesCollection, [
            Query.equal('name', category)
        ]).then((response) => {
            return response.documents.length > 0;
        });
    } catch(e) {
        return Promise.reject(e);
    }
}

const subcategoryPages = async (subcategory: string, auth: string | undefined) => {
    try {
        const staffBool = auth ? await isStaff(auth) : false;
        const queries = [
            Query.equal('subcategory', subcategory),
            Query.equal('approved', true)
        ]
    
        if (!staffBool) {
            queries.push(Query.equal('approved', true));
        }
    
        return databases.listDocuments(databaseID, postsCollection, queries).then((response) => {
            return Math.ceil(response.total / 10);
        });
    } catch(e) {
        return Promise.reject(e);
    }
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
    categoryExists,
    subcategoryPages
};