import * as z from 'zod';
import { location, user } from './derive-inputs.spec';
import deriveDefaultValues from './derive-default-values';

describe('deriveDefaultValues', () => {
    it('should derive default values for user', () => {
        const schema = z.object(user);
        const defaultValues = deriveDefaultValues(schema);
        expect(defaultValues).toEqual({ 
            "age": 25,
            "email": "johndoe@me.com",
            "firstName": "John",
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "isActive": true,
            "lastName": "Doe",
            "picture": "https://i.pravatar.cc/300",
            "userName": "johndoe",
        });
    });

    it('should derive default values for location', () => {
        const schema = z.object(location);
        const defaultValues = deriveDefaultValues(schema);
        expect(defaultValues).toEqual({ 
            "address": '',
            "city": '',
            "country": '',
            "state": '',
            "zipcode": ''
        });
    });

    it('should derive default values for user and location', () => {
        const schema = z.object({ ...user, location: z.object(location) });
        const defaultValues = deriveDefaultValues(schema);
        expect(defaultValues).toEqual({
            "age": 25,
            "email": "johndoe@me.com",
            "firstName": "John",
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "isActive": true,
            "lastName": "Doe",
            "picture": "https://i.pravatar.cc/300",
            "userName": "johndoe",
            "location": {
                "address": '',
                "city": '',
                "country": '',
                "state": '',
                "zipcode": ''
            },
        });
    })
})