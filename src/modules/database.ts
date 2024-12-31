import { Client, Databases, ID, Account, Query } from 'node-appwrite';
import { CommentData, PostData } from '../Types';

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

const signup = (email: string, username: string, password: string) => {
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

const login = (username: string, password: string) => {
    return databases.listDocuments(databaseID, usernamesCollection, [
        Query.equal("username", username)
    ]).then((response) => {
        const user = response.documents[0];
        return accounts.createEmailPasswordSession(user.email, password)
    })
}

const getCategories = () => {
    return databases.listDocuments(databaseID, categoriesCollection);
}

const getSubcategories = () => {
    return databases.listDocuments(databaseID, subcategoriesCollection);
}

const getPostsInSubcategory = (subcategory: string) => {
    return databases.listDocuments(databaseID, postsCollection, [
        Query.equal("subcategory", subcategory)
    ]);
}

const getUser = (secret: string) => {
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

const userExists = (secret: string) => {
    const client = new Client().setEndpoint(endpoint).setProject(project).setSession(secret);
    const clientAccounts = new Account(client);
    return clientAccounts.get().then(() => {
        return true;
    }).catch(() => {
        return false;
    })
}

const isStaff = (secret: string) => {
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

const getPost = (id: string) => {
    return databases.getDocument(databaseID, postsCollection, id);
}

const postExists = (id: string) => {
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

const deletePost = (id: string) => {
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

const getPostComments = (id: string) => {
    return databases.listDocuments(databaseID, commentsCollection, [
        Query.equal("post_id", id)
    ]);
}

const likePost = async (id: string, session: string) => {
    const user = await getUser(session);
    const post = await getPost(id);

    if (post.likes.includes(user.$id)) {
        return databases.updateDocument(databaseID, postsCollection, id, {
            likes: post.likes.filter((like: string) => like !== user.$id)
        });
    } else {
        return databases.updateDocument(databaseID, postsCollection, id, {
            likes: [...post.likes, user.$id]
        });
    }
}

const getLikes = (session: string) => {
    return getUser(session).then((user) => {
        return databases.listDocuments(databaseID, postsCollection, [
            Query.contains("likes", [user.$id])
        ])
    })
}

const commentExists = (id: string) => {
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
    deleteComment
};