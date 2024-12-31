import { Client, Databases, ID, Account, Query } from 'node-appwrite';
import { PostData } from '../Types';

const endpoint: string = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const project: string = process.env.APPWRITE_PROJECT || "";
const key: string = process.env.APPWRITE_API_KEY || "";

const databaseID: string = process.env.APPWRITE_DATABASE_ID || "";
const usernamesCollection: string = process.env.APPWRITE_USERNAMES_COLLECTION_ID || "";
const categoriesCollection: string = process.env.APPWRITE_CATEGORIES_COLLECTION_ID || "";
const subcategoriesCollection: string = process.env.APPWRITE_SUBCATEGORIES_COLLECTION_ID || "";
const postsCollection: string = process.env.APPWRITE_POSTS_COLLECTION_ID || "";

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
    return databases.createDocument(
        databaseID,
        postsCollection,
        ID.unique(),
        {
            ...data,
            approved: false
        }
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

const updatePost = (id: string, data: PostData) => {
    data.approved = false;
    return databases.updateDocument(databaseID, postsCollection, id, data);
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
    updatePost
};