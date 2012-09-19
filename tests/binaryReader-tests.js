var test = require('tap').test;
var BinaryReader = require('../beConverters').BinaryReader;

  test('New BinaryReader requires a Buffer as the first parameter', function(t) {
    t.plan(1);
    
    var reader = new BinaryReader();
    t.deepEqual(reader, {});
  });

  test('New BinaryReader defaults start position to 0', function(t) {
    t.plan(1);
    var reader = new BinaryReader(new Buffer(0))
    t.equal(reader.getPosition(), 0, 'default position should be 0');
  });

  test('BinaryReader.getBufffer returns original buffer', function(t) {
    t.plan(2);
    
    var buffer = new Buffer([4, 5]);

    var reader = new BinaryReader(buffer)
    var returnedBuffer = reader.getBuffer();

    t.equal(returnedBuffer[0], 4);
    t.equal(returnedBuffer[1], 5);
  });

  test('BinaryReader.readByte returns a returns unsigned byte', function(t) {
    t.plan(1);
    
    var buffer = new Buffer([250]);

    var reader = new BinaryReader(buffer)
    var result = reader.readByte();

    t.equal(result, 250);
  });

  test('BinaryReader.readSByte returns a returns signed byte', function(t) {
    t.plan(1);
    
    var buffer = new Buffer([-4]);

    var reader = new BinaryReader(buffer)
    var result = reader.readSByte();

    t.equal(result, -4);
  });

  test('BinaryReader.readShort returns a returns signed Int16', function(t) {
    t.plan(1);
    
    var buffer = new Buffer([0x83, 0x7B]);

    var reader = new BinaryReader(buffer)
    var result = reader.readShort();

    t.equal(result, -31877);
  });
