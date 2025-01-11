import { Express, Request, Response } from 'express';
import { commentExists, deleteComment, getComment, getUser, userExists } from '../../modules/database';
import deleteCommentRoute from '../deleteComment';

jest.mock('../../modules/database');

describe("deleteComment", () => {
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

        (commentExists as jest.Mock).mockClear();
        (deleteComment as jest.Mock).mockClear();
        (getComment as jest.Mock).mockClear();
        (getUser as jest.Mock).mockClear();
        (userExists as jest.Mock).mockClear();

        deleteCommentRoute(mockApp);
    });

    test("returns 400 for empty request body", async () => {
        mockReq = { body: {} };

        await routeHandler(mockReq, mockRes);

        expect(deleteComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 400 for missing body", async () => {
        mockReq = {};

        await routeHandler(mockReq, mockRes);

        expect(deleteComment).not.toHaveBeenCalled();
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

        expect(deleteComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot invoke method'
        });
    });

    test("returns 404 for non-existing comment", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (commentExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(deleteComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Comment not found'
        });
    });

    test("returns 403 when user is not the author of the comment", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (commentExists as jest.Mock).mockResolvedValue(true);
        (getComment as jest.Mock).mockResolvedValue({ author: "anotherUserId" });
        (getUser as jest.Mock).mockResolvedValue({ $id: "userId" });

        await routeHandler(mockReq, mockRes);

        expect(deleteComment).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot delete comment'
        });
    });

    test("successfully deletes a comment", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (userExists as jest.Mock).mockResolvedValue(true);
        (commentExists as jest.Mock).mockResolvedValue(true);
        (getComment as jest.Mock).mockResolvedValue({ author: "userId" });
        (getUser as jest.Mock).mockResolvedValue({ $id: "userId" });
        (deleteComment as jest.Mock).mockResolvedValue(true);

        await routeHandler(mockReq, mockRes);

        expect(deleteComment).toHaveBeenCalledWith("testId");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comment deleted successfully'
        });
    });
});