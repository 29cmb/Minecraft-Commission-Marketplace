import { Express, Request, Response } from 'express';
import { updateRecovery } from '../../modules/database';
import applyRecoveredPassword from '../applyRecoveredPassword';

jest.mock('../../modules/database');

describe('applyRecoveredPassword', () => {
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

        (updateRecovery as jest.Mock).mockClear();

        applyRecoveredPassword(mockApp);
    });

    test('successfully resets password with valid input', async () => {
        mockReq = {
            body: {
                uid: 'testUid',
                secret: 'testSecret',
                password: 'newPassword'
            }
        };

        (updateRecovery as jest.Mock).mockResolvedValue(undefined);

        await routeHandler(mockReq, mockRes);

        expect(updateRecovery).toHaveBeenCalledWith('testUid', 'testSecret', 'newPassword');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Password reset successfully'
        });
    });

    test.each([
        ['missing uid', { secret: 'secret', password: 'pass' }],
        ['missing secret', { uid: 'uid', password: 'pass' }],
        ['missing password', { uid: 'uid', secret: 'secret' }],
        ['invalid uid type', { uid: 123, secret: 'secret', password: 'pass' }],
        ['invalid secret type', { uid: 'uid', secret: 123, password: 'pass' }],
        ['invalid password type', { uid: 'uid', secret: 'secret', password: 123 }]
    ])('returns 400 for %s', async (_, body) => {
        mockReq = { body };
        
        await routeHandler(mockReq, mockRes);

        expect(updateRecovery).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test('returns 400 for empty request body', async () => {
        mockReq = { body: {} };

        await routeHandler(mockReq, mockRes);

        expect(updateRecovery).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });

    test('returns 400 for missing body', async () => {
        mockReq = {};

        await routeHandler(mockReq, mockRes);

        expect(updateRecovery).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Required fields not provided or not formatted properly'
        });
    });
});