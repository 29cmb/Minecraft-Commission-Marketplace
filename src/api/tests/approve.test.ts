import { Express, Request, Response } from 'express';
import { postExists, setApproved, userExists, isStaff } from '../../modules/database';
import approve from '../approve';

jest.mock('../../modules/database');

describe("approve", () => {
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

        (setApproved as jest.Mock).mockClear();

        approve(mockApp);
    });

    test("successfully approves with valid input", async () => {
        mockReq = {
            body: {
                id: "testId"
            },
            headers: {
                authorization: "testAuth"
            }
        };

        (postExists as jest.Mock).mockResolvedValue(true);
        (userExists as jest.Mock).mockResolvedValue(true);
        (isStaff as jest.Mock).mockResolvedValue(true);
        (setApproved as jest.Mock).mockResolvedValue(true);

        await routeHandler(mockReq, mockRes);
        expect(setApproved).toHaveBeenCalledWith("testId", true);
    })

    test.each([
        ["missing body", {}],
        ["invalid body type", { body: 123 }],
        ["missing id", { headers: { authorization: "" }}],
        ["invalid id type", { body: { id: 123 }, headers: { authorization: "" }}],
        ["missing authorization", { body: { id: "testId" }}],
        ["invalid authorization type", { body: { id: "testId" }, headers: { authorization: "" }}]
    ])("returns 400 for %s", async (_, req) => {
        mockReq = req;
        
        (postExists as jest.Mock).mockResolvedValue(true);
        (userExists as jest.Mock).mockResolvedValue(true);
        (isStaff as jest.Mock).mockResolvedValue(true);
        (setApproved as jest.Mock).mockResolvedValue(true);

        await routeHandler(mockReq, mockRes);
        expect(mockRes.status).not.toHaveBeenCalledWith(200);
    })
})