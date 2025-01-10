import { Express, Request, Response } from 'express';
import categories from "../categories";
import { getCategories } from '../../modules/database';

jest.mock('../../modules/database');

describe("categories", () => {
    let mockApp: Express;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let routeHandler: Function;
    beforeEach(() => {
        mockApp = {
            get: jest.fn((route, handler) => {
                routeHandler = handler;
            })
        } as any;

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        (getCategories as jest.Mock).mockClear();

        categories(mockApp);
    });

    test("returns categories", async () => {
        mockReq = {};

        (getCategories as jest.Mock).mockResolvedValue([
            {
                "name": "testCategory",
                "$id": "testId",
                "$createdAt": "2023-10-01T00:00:00.000Z",
                "$updatedAt": "2023-10-01T00:00:00.000Z",
                "$permissions": [],
                "$databaseId": "testDatabaseId",
                "$collectionId": "testCollectionId",
                "subcategoriesCount": 1,
                "postsCount": 1
            }
        ])

        await routeHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200)
    })
})