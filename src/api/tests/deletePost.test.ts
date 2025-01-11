import { Express, Request, Response } from 'express';
import { deletePost, getPost, getUser, postExists, userExists } from '../../modules/database';
import deletePostRoute from '../deletePost';

jest.mock('../../modules/database');

describe("deletePost", () => {
    let mockApp: Express;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let routeHandler: Function;

    beforeEach(() => {
        mockApp = {
            post: jest.fn((route, handler) => {
                routeHandler = handler;
            })
        } as any;

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        (deletePost as jest.Mock).mockClear();
        (getPost as jest.Mock).mockClear();
        (getUser as jest.Mock).mockClear();
        (postExists as jest.Mock).mockClear();
        (userExists as jest.Mock).mockClear();

        deletePostRoute(mockApp);
    });

    test("returns 400 for empty request body", async () => {
        mockReq = { body: {} };

        await routeHandler(mockReq, mockRes);

        expect(deletePost).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 400 for missing body", async () => {
        mockReq = {};

        await routeHandler(mockReq, mockRes);

        expect(deletePost).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 403 for missing authorization", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: {}
        };

        (userExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(deletePost).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot invoke method'
        });
    });

    test("returns 404 for non-existing post", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (postExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(deletePost).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Post not found'
        });
    });

    test("returns 403 when user is not the author of the post", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (postExists as jest.Mock).mockResolvedValue(true);
        (getPost as jest.Mock).mockResolvedValue({ author: "anotherUserId" });
        (getUser as jest.Mock).mockResolvedValue({ $id: "userId" });

        await routeHandler(mockReq, mockRes);

        expect(deletePost).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot delete post'
        });
    });

    test("successfully deletes a post", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (postExists as jest.Mock).mockResolvedValue(true);
        (getPost as jest.Mock).mockResolvedValue({ author: "userId" });
        (getUser as jest.Mock).mockResolvedValue({ $id: "userId" });
        (deletePost as jest.Mock).mockResolvedValue(true);

        await routeHandler(mockReq, mockRes);

        expect(deletePost).toHaveBeenCalledWith("testId");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Post deleted successfully'
        });
    });
});