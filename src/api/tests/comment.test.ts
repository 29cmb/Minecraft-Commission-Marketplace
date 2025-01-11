import { Express, Request, Response } from 'express';
import { getPost, getUser, isStaff, userExists, postComment, postExists } from '../../modules/database';
import comment from '../comment';

jest.mock('../../modules/database');

describe("comment", () => {
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

        (getPost as jest.Mock).mockClear();
        (getUser as jest.Mock).mockClear();
        (isStaff as jest.Mock).mockClear();
        (userExists as jest.Mock).mockClear();
        (postComment as jest.Mock).mockClear();
        (postExists as jest.Mock).mockClear();

        comment(mockApp);
    });

    test("returns 400 for empty request body", async () => {
        mockReq = { body: {} };

        await routeHandler(mockReq, mockRes);

        expect(postComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 400 for missing body", async () => {
        mockReq = {};

        await routeHandler(mockReq, mockRes);

        expect(postComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 401 for missing authorization", async () => {
        mockReq = {
            body: { id: "testId", comment: "testComment" },
            headers: {}
        };

        (userExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(postComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot invoke method'
        });
    });

    test("returns 404 for non-existing post", async () => {
        mockReq = {
            body: { id: "testId", comment: "testComment" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (postExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(postComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Post not found'
        });
    });

    test("returns 403 when comments are disabled and user is not staff", async () => {
        mockReq = {
            body: { id: "testId", comment: "testComment" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (postExists as jest.Mock).mockResolvedValue(true);
        (getPost as jest.Mock).mockResolvedValue({ comments_enabled: false });
        (isStaff as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(postComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Comments are disabled for this post'
        });
    });

    test("successfully posts a comment", async () => {
        mockReq = {
            body: { id: "testId", comment: "testComment" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (postExists as jest.Mock).mockResolvedValue(true);
        (getPost as jest.Mock).mockResolvedValue({ comments_enabled: true });
        (getUser as jest.Mock).mockResolvedValue({ $id: "userId" });
        (postComment as jest.Mock).mockResolvedValue(true);

        await routeHandler(mockReq, mockRes);

        expect(postComment).toHaveBeenCalledWith({
            post_id: "testId",
            content: "testComment",
            author: "userId"
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comment posted successfully'
        });
    });
})