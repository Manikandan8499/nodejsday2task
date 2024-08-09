import express from 'express';

const server = express();
const port = 8000;

server.use(express.json());



let rooms = [];
let bookings = [];

// server.get("/list-rooms", (req, res)=>{
//     res.status(201).json({ roomslist: rooms });
// });
// 1. Creating a Room
server.post('/create-room', (req, res) => {
    const { numberOfSeats, amenities, pricePerHour } = req.body;
    const room = { id: rooms.length + 1, numberOfSeats, amenities, pricePerHour };
    rooms.push(room);
    res.status(201).json(room);
});

// 2. Booking a Room
// server.post('/bookings', (req, res) => {
//     const { customerName, date, startTime, endTime, roomId } = req.body;
//     const booking = { id: bookings.length + 1, customerName, date, startTime, endTime, roomId };
//     bookings.push(booking);
//     res.status(201).json(booking);
// });

// 2. Booking a Room with conflict checking
server.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;
    const conflictingBooking = bookings.find(booking => 
        booking.roomId === roomId &&
        booking.date === date &&
        (
            (startTime >= booking.startTime && startTime < booking.endTime) || 
            (endTime > booking.startTime && endTime <= booking.endTime) ||     
            (startTime <= booking.startTime && endTime >= booking.endTime)    
        )
    );
    if (conflictingBooking) {
        return res.status(400).json({
            message: 'Room is already booked during the requested time slot',
            conflictingBooking
        });
    }

    const booking = { id: bookings.length + 1, customerName, date, startTime, endTime, roomId };
    bookings.push(booking);
    res.status(201).json(booking);
});



// 3. List all Rooms with Booked Data
server.get('/booked-rooms', (req, res) => {
    const roomsWithBookings = rooms.map(room => {
        const roomBookings = bookings.filter(booking => booking.roomId === room.id);
        return { ...room, bookingstatus: roomBookings };
    });
    res.json(roomsWithBookings);
});

// 4. List all Customers with Booked Data
server.get('/customers', (req, res) => {
    const customers = bookings.map(booking => {
        const room = rooms.find(room => room.id === booking.roomId);
        return { ...booking, roomName: room ? room.roomName : 'Unknown' };
    });
    res.json(customers);
});

// 5. List how many times a customer has booked the room
server.get('/customer-bookings/:customerName', (req, res) => {
    const { customerName } = req.params;
    const customerBookings = bookings.filter(booking => booking.customerName === customerName);
    const response = customerBookings.map(booking => {
        const room = rooms.find(room => room.id === booking.roomId);
        return { ...booking, roomName: room ? room.roomName : 'Unknown' };
    });
    res.json(response);
});


server.listen(port, ()=>{
    console.log("port listening on " + port);
})
//console.log("hello world");