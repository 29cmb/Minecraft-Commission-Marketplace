import { Express, Request, Response } from 'express';
import { isStaff, postExists, setApproved, userExists } from '../../modules/database';
import deny from '../deny';

jest.mock('../../modules/database');

describe("deny", () => {
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

        (isStaff as jest.Mock).mockClear();
        (postExists as jest.Mock).mockClear();
        (setApproved as jest.Mock).mockClear();
        (userExists as jest.Mock).mockClear();

        deny(mockApp);
    });

    test("returns 400 for empty request body", async () => {
        mockReq = { body: {} };

        await routeHandler(mockReq, mockRes);

        expect(setApproved).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 400 for missing body", async () => {
        mockReq = {};

        await routeHandler(mockReq, mockRes);

        expect(setApproved).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test("returns 404 for non-existing post", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (postExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(setApproved).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Post not found'
        });
    });

    test("returns 403 for missing authorization", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: {}
        };

        (postExists as jest.Mock).mockResolvedValue(true);
        (userExists as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(setApproved).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot invoke method'
        });
    });

    test("returns 403 for non-staff user", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (postExists as jest.Mock).mockResolvedValue(true);
        (userExists as jest.Mock).mockResolvedValue(true);
        (isStaff as jest.Mock).mockResolvedValue(false);

        await routeHandler(mockReq, mockRes);

        expect(setApproved).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'User cannot invoke method'
        });
    });

    test("successfully denies a post", async () => {
        mockReq = {
            body: { id: "testId" },
            headers: { authorization: "testAuth" }
        };

        (postExists as jest.Mock).mockResolvedValue(true);
        (userExists as jest.Mock).mockResolvedValue(true);
        (isStaff as jest.Mock).mockResolvedValue(true);
        (setApproved as jest.Mock).mockResolvedValue(true);

        await routeHandler(mockReq, mockRes);

        expect(setApproved).toHaveBeenCalledWith("testId", false);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Denied successfully'
        });
    });
});