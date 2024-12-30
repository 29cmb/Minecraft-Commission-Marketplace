import { Client, Databases, ID, Account, Query } from 'node-appwrite';

const endpoint: string = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const project: string = process.env.APPWRITE_PROJECT || "";
const key: string = process.env.APPWRITE_API_KEY || "";

const databaseID: string = process.env.APPWRITE_DATABASE_ID || "";
const usernamesCollection: string = process.env.APPWRITE_USERNAMES_COLLECTION_ID || "";
const categoriesCollection: string = process.env.APPWRITE_CATEGORIES_COLLECTION_ID || "";
const subcategoriesCollection: string = process.env.APPWRITE_SUBCATEGORIES_COLLECTION_ID || "";

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

export { signup, login, getCategories, getSubcategories };