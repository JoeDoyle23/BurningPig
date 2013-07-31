var should = require('should');
var Packet = require('../../network/packet');

describe('Packet', function() {
	var packet;
	
	beforeEach(function(){
		packet = new Packet(10);
	});

	describe('#Packet()', function() {
		it('should create a new buffer matching the size passed in', function() {
			packet.buffer.length.should.equal(10);
		});

		it('should set cursor to zero', function() {
			packet.cursor.should.equal(0);
		});	
	});
	
	describe('#result()', function() {
		it('should return the buffer', function() {
			packet.result().should.equal(packet.buffer);
		});
	});	
	
	describe('#getPosition()', function() {
		it('should return the cursor', function() {
			packet.cursor = 5;
			packet.getPosition().should.equal(5);
		});
	});

	describe('#writeString()', function() {
		
		beforeEach(function() {
			packet.writeString('a');
		});

		it('should write two bytes for string length at the cursor', function() {
			packet.getPosition().should.equal(4);
			packet.buffer.readInt16BE(0).should.equal(1);
		});

		it('should write each letter as two bytes', function() {
			packet.getPosition().should.equal(4);
			packet.buffer.readInt16BE(2).should.equal(97);
		});
	});
	
	describe('#writeArray()', function() {
		it('should write the contents of the provided buffer at the cursor', function() {
			var buffer = new Buffer(4);
			buffer.writeInt32BE(1234567890, 0);
			
			packet.writeArray(buffer);
			
			packet.getPosition().should.equal(4);
			packet.buffer.readInt32BE(0).should.equal(1234567890);
		});

		it('should incrament the cursor based on the length of the given buffer', function() {
			var startingCursor = packet.cursor;
			var buffer = new Buffer(8);			
			
			packet.writeArray(buffer);
			
			packet.getPosition().should.equal(startingCursor + buffer.length);			
		});
	});	

	describe('#writeBool()', function() {
		it('should write the contents of the provided buffer at the cursor', function() {
			packet.writeBool(true);
			
			packet.getPosition().should.equal(1);
			packet.buffer.readUInt8(0).should.equal(1);
		});

		it('should incrament the cursor by 1', function() {
			var startingCursor = packet.cursor;
			
			packet.writeBool(true);
			
			packet.getPosition().should.equal(startingCursor + 1);
		});
	});
	
	
});