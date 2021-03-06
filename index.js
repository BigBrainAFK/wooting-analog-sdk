const ffi = require('ffi');
const ref = require('ref');
const StructType = require('ref-struct');
const ArrayType = require('ref-array');
const {
	getError,
	WootingAnalogResult_Enum,
	DeviceEventType_Enum,
	KeycodeType_Enum,
	VirtualKey_Enum,
	ScanCodes_Enum,
} = require(__dirname + '/util');

const platform = (require('os')).platform();
if (platform === 'win32'){
    woot_loc = './wrapper/wooting_analog_wrapper.dll';
}else if(platform === 'linux'){
    woot_loc = './wrapper/libwooting_analog_wrapper.so';
}else if(platform === 'darwin'){
    woot_loc = './wrapper/libwooting_analog_wrapper.dylib';
}else{
    throw new Error('unsupported platform for the wooting_analog_wrapper')
}

const ushort = ref.types.ushort;
const ushort_Ptr = ref.refType(ushort);
const ushortArray = ArrayType(ushort);
const ushortArray_Ptr = ref.refType(ushortArray);
const float = ref.types.float;
const float_Ptr = ref.refType(float);
const floatArray = ArrayType(float);
const floatArray_Ptr = ref.refType(floatArray);

const WootingAnalogResult = ref.types.int;
const WootingAnalog_DeviceID = ref.types.uint64;
const WootingAnalog_DeviceInfo = StructType({
    vendor_id: ref.types.uint16,
    product_id: ref.types.uint16,
    manufacturer_name: ref.types.CString,
    device_name: ref.types.CString,
    device_id: WootingAnalog_DeviceID,
});
const WootingAnalog_DeviceInfo_Ptr = ref.refType(WootingAnalog_DeviceInfo);
const WootingAnalog_DeviceEventType = ref.types.int;
const WootingAnalogCallback = ffi.Function(ref.types.void, [
	WootingAnalog_DeviceEventType,
	WootingAnalog_DeviceInfo_Ptr,
]);
const WootingAnalog_KeycodeType = ref.types.int;

const wooting_analog_wrapper = ffi.Library(__dirname + woot_loc, {
	'wooting_analog_clear_device_event_cb': [
		WootingAnalogResult,
		[]
	],
	'wooting_analog_get_connected_devices_info': [
		ref.types.int,
		[
			WootingAnalog_DeviceInfo_Ptr, ref.types.uint,
		]
	],
	'wooting_analog_initialise': [
		WootingAnalogResult,
		[]
	],
	'wooting_analog_is_initialised': [
		ref.types.bool,
		[]
	],
	'wooting_analog_read_analog': [
		ref.types.float,
		[
			ref.types.ushort,
		]
	],
	'wooting_analog_read_analog_device': [
		ref.types.float,
		[
			ref.types.ushort,
			WootingAnalog_DeviceID,
		]
	],
	'wooting_analog_read_full_buffer': [
		ref.types.int,
		[
			ushortArray_Ptr,
			floatArray_Ptr,
			ref.types.uint,
		]
	],
	'wooting_analog_read_full_buffer_device': [
		ref.types.int,
		[
			ushortArray_Ptr,
			floatArray_Ptr,
			ref.types.uint,
			WootingAnalog_DeviceID,
		]
	],
	'wooting_analog_set_device_event_cb': [
		WootingAnalogResult,
		[
			WootingAnalogCallback,
		]
	],
	'wooting_analog_set_keycode_mode': [
		WootingAnalogResult,
		[
			WootingAnalog_KeycodeType,
		]
	],
	'wooting_analog_uninitialise': [
		WootingAnalogResult,
		[]
	],
});

class WootingWrapper {
	/**
	 * Clears the device callback function
	 *
	 * @returns { number } The result of the function
	 * @memberof WootingWrapper
	 */
	clear_device_event_cb() {
		const result = wooting_analog_wrapper.wooting_analog_clear_device_event_cb();

		if (result !== WootingAnalogResult_Enum.Ok) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Fetches the connected devices infos
	 *
	 * @param { Buffer } device_info Device info buffer
	 * @param { number } length Length of the buffer to fill
	 * @returns { number } If bigger than 0 the number of devices that are connected
	 * @memberof WootingWrapper
	 */
	get_connected_devices_info(device_info, length) {
		const result = wooting_analog_wrapper.wooting_analog_get_connected_devices_info(device_info, length);

		if (result < 0) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Initilizes the Wooting Analog Wrapper
	 *
	 * @returns { number } The result of the function
	 * @memberof WootingWrapper
	 */
	initialise() {
		const result = wooting_analog_wrapper.wooting_analog_initialise();

		if (result !== WootingAnalogResult_Enum.Ok) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Checks if the Wooting Analog Wrapper is initilized
	 *
	 * @returns { boolean } True if initilized, false otherwise
	 * @memberof WootingWrapper
	 */
	is_initialised() {
		return wooting_analog_wrapper.wooting_analog_is_initialised();
	}

	/**
	 * Read the Analog value of a specified key
	 *
	 * @param { number } keyCode keyCode of the key you want to read
	 * @returns { number } Analog value of the specified key
	 * @memberof WootingWrapper
	 */
	read_analog(keyCode) {
		const result = wooting_analog_wrapper.wooting_analog_read_analog(keyCode);

		if (result < 0 || result > 1) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Reads the analog value of a specified key from the specified device
	 *
	 * @param { number } keyCode The keyCode you want to fetch
	 * @param { number } device_id The device id that will be fetched from
	 * @returns { number } Analog value of the specified key
	 * @memberof WootingWrapper
	 */
	read_analog_device(keyCode, device_id) {
		const result = wooting_analog_wrapper.wooting_analog_read_analog_device(keyCode, device_id);

		if (result < 0 || result > 1) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Read the full analog buffer of a specified key
	 *
	 * @param { Buffer } code_buffer The keyCode buffer
	 * @param { Buffer } analog_buffer The analog buffer
	 * @param { number } length The length of the code and analog buffer
	 * @returns { number }
	 * @memberof WootingWrapper
	 */
	read_full_buffer(code_buffer, analog_buffer, length) {
		const result = wooting_analog_wrapper.wooting_analog_read_full_buffer(code_buffer, analog_buffer, length);

		if (result < 0) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Read the full analog buffer of a specified key from a specified device
	 *
	 * @param { Buffer } code_buffer The keyCode buffer
	 * @param { Buffer } analog_buffer The analog buffer
	 * @param { number } length The length of the code and analog buffer
	 * @param { number } device_id The device id that will be fetched from
	 * @returns { number }
	 * @memberof WootingWrapper
	 */
	read_full_buffer_device(code_buffer, analog_buffer, length, device_id) {
		const result = wooting_analog_wrapper.wooting_analog_read_full_buffer_device(code_buffer, analog_buffer, length, device_id);

		if (result < 0) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Set the analog device callback function
	 *
	 * @param { Object } callback The callback function to call on device events
	 * @returns { number }
	 * @memberof WootingWrapper
	 */
	set_device_event_cb(callback) {
		this.ffi_callback = ffi.Callback(ref.types.void, [
			WootingAnalog_DeviceEventType,
			WootingAnalog_DeviceInfo_Ptr,
		], (eventType, deviceInfo) => {
			setImmediate(callback, eventType, deviceInfo.deref());
		});

		const result = wooting_analog_wrapper.wooting_analog_set_device_event_cb(this.ffi_callback);

		if (result !== WootingAnalogResult_Enum.Ok) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Set the key mode of the device
	 *
	 * @param { number } mode The mode you want to set the device to
	 * @returns { number }
	 * @memberof WootingWrapper
	 */
	set_keycode_mode(mode) {
		const result = wooting_analog_wrapper.wooting_analog_set_keycode_mode(mode);

		if (result !== WootingAnalogResult_Enum.Ok) throw Error(getError(WootingAnalogResult_Enum, result));

		return result;
	}

	/**
	 * Uninitilize the Wooting Analog Wrapper
	 *
	 * @returns { number }
	 * @memberof WootingWrapper
	 */
	uninitialise() {
		return wooting_analog_wrapper.wooting_analog_uninitialise();
	}
}

module.exports = {
	WootingWrapper,
	WootingAnalogResult: WootingAnalogResult_Enum,
	DeviceEventType: DeviceEventType_Enum,
	KeycodeType: KeycodeType_Enum,
	types: {
		WootingAnalogResult,
		WootingAnalog_DeviceID,
		WootingAnalog_DeviceInfo,
		WootingAnalog_DeviceInfo_Ptr,
		WootingAnalog_DeviceEventType,
		WootingAnalogCallback,
		WootingAnalog_KeycodeType,
		ushort,
		ushort_Ptr,
		ushortArray,
		ushortArray_Ptr,
		float,
		float_Ptr,
		floatArray,
		floatArray_Ptr,
	},
	VirtualKey: VirtualKey_Enum,
	ScanCodes_Enum,
}
