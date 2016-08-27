var host;
var port;
var deviceAddress;
var functionCode;
var registerAddress;
var registerQuantity;
var dataQuantity;
var displayType;
var request;
var requestHTML;
var modbusUrl;
var countTotal = 0;
var countSuccess = 0;

var timer = null;
var trafficAutoScroll = true;
var addData = null;

function addTraffic(success, data, msg) {
	var content;
    
    var content = '<li id="traffic-no-' + countTotal +'"';
	if (success) {
		content += '><p><strong>';
	} else {
		content += ' data-theme="b"><p><strong>';
	}
    
    content += 'No. ' + countTotal + ' ';

	switch (functionCode) {
	case '4':
		content += 'Read Input Registers ';
		break;
	case '3':
		content += 'Read Holding Registers ';
		break;
	default:
		content += 'BUG! Please Fix ME. ';
		break;
	}

	content += registerAddress + " ~ ";
	content += Number(registerAddress) + Number(registerQuantity) - 1;
    content += ' ' + msg + '</strong></p>';

	var responseHTML;
	if (success) {
		responseHTML = '<span class="mb-dev-addr">' + data.substring(0, 2)
				+ '</span>';
		responseHTML += '<span class="mb-func-code">' + data.substring(2, 4)
				+ '</span>';
		responseHTML += '<span class="mb-reg-quantity">' + data.substring(4, 6)
				+ '</span>';
		responseHTML += '<span class="mb-data">'
				+ data.substring(6, 6 + registerQuantity * 4) + '</span>';
		responseHTML += '<span class="mb-crc">'
				+ data.substring(6 + registerQuantity * 4,
						10 + registerQuantity * 4) + '</span>';
	} else {
		responseHTML = data;
	}

	content += '<p>-&gt;' + requestHTML + '</p>';
	content += '<p>&lt;-' + responseHTML + '</p>';
	content += '</li>';

	$("#listview-traffic").append(content);
	$("#listview-traffic").listview('refresh');

	if (trafficAutoScroll) {
		window.scrollBy(0, window.innerHeight);
	}

	if (success) {
		countSuccess++;
	}

	$('#traffic-count').html(
			'Success ' + countSuccess + ' / Total ' + countTotal);

}

function addDataInt16(data) {
    var i;
    var listview = $('#listview-data');
    listview.empty();
    for(i = 0; i < dataQuantity; i++){
        var n = parseInt(data.substring(6 + i * 4, 10 + i * 4), 16);
        listview.append('<li>' + n + '</li>');
    }
    listview.listview('refresh');
}

function addDataInt32(data) {
    var i;
    var listview = $('#listview-data');
    listview.empty();
    for(i = 0; i < dataQuantity; i++){
        var n = parseInt(data.substring(6 + i * 8, 14 + i * 8), 16);
        listview.append('<li>' + n + '</li>');
    }
    listview.listview('refresh');
}

function addDataFloat(data) {
    var i;
    var listview = $('#listview-data');
    listview.empty();
    for(i = 0; i < dataQuantity; i++){
        var n = parseInt(data.substring(6 + i * 8, 14 + i * 8), 16);
        listview.append('<li>' + n + 'FIXME</li>');
    }
    listview.listview('refresh');
}

function successTraffic(data, status) {
    if(displayType == "traffic") {
        if (status == 'success' && data.length >= 8 + registerQuantity * 4) {
            addTraffic(true, data, 'SUCCESS');
        } else {
            addTraffic(false, data, 'INVALID RESPONSE');
        }
    } else {
        addData(data);
    }
}

function errorTraffic(xhr, msg, err) {
    if(displayType == "traffic") {
        addTraffic(false, '', msg.toUpperCase());
    } else {
        
    }
}

function modbusTraffic() {
	countTotal++;
	$.ajax({ url: modbusUrl, success: successTraffic, error: errorTraffic});

	// var content = '<li> \
	// <p> \
	// <strong>Read Input Registers 6 ~ 7 Success</strong> \
	// </p> \
	// <p> \
	// -&gt;<span class="mb-dev-addr">08</span><span
	// class="mb-func-code">03</span><span class="mb-reg-addr">0006</span><span
	// class="mb-reg-quantity">0002</span><span class="mb-crc">FE</span> \
	// </p> \
	// <p> \
	// &lt;-<span class="mb-dev-addr">08</span><span
	// class="mb-func-code">03</span><span
	// class="mb-reg-quantity">02</span><span
	// class="mb-data">0356FE12</span><span class="mb-crc">FE</span> \
	// </p> \
	// </li>';
	// $("#listview-traffic").append(content);
	// // $("#listview-traffic").listview('refresh');
	//
	// window.scroll(0, 68835);

	timer = setTimeout(modbusTraffic, 1000);
}

function intToHex(data, size) {
	var hex;
	hex = data.toString(16);
	for (var i = 2 * size, len = hex.length; i > len; i--) {
		hex = "0" + hex;
	}

	return hex;
}

function byteToHex(b) {
	return intToHex(b, 1);
}

function shortToHex(s) {
	return intToHex(s, 2);
}

function longToHex(s) {
	return intToHex(s, 4);
}

function byteArrayToHex(array) {
	var hex = "";
	for (var i = 0, len = array.length; i < len; i++) {
		hex += byteToHex(array[i]);
	}

	return hex;
}

var aucCRCHi = new Array(0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00,
		0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00,
		0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00,
		0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00,
		0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00,
		0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01,
		0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00,
		0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01,
		0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40);

var aucCRCLo = new Array(0x00, 0xC0, 0xC1, 0x01, 0xC3, 0x03, 0x02, 0xC2, 0xC6,
		0x06, 0x07, 0xC7, 0x05, 0xC5, 0xC4, 0x04, 0xCC, 0x0C, 0x0D, 0xCD, 0x0F,
		0xCF, 0xCE, 0x0E, 0x0A, 0xCA, 0xCB, 0x0B, 0xC9, 0x09, 0x08, 0xC8, 0xD8,
		0x18, 0x19, 0xD9, 0x1B, 0xDB, 0xDA, 0x1A, 0x1E, 0xDE, 0xDF, 0x1F, 0xDD,
		0x1D, 0x1C, 0xDC, 0x14, 0xD4, 0xD5, 0x15, 0xD7, 0x17, 0x16, 0xD6, 0xD2,
		0x12, 0x13, 0xD3, 0x11, 0xD1, 0xD0, 0x10, 0xF0, 0x30, 0x31, 0xF1, 0x33,
		0xF3, 0xF2, 0x32, 0x36, 0xF6, 0xF7, 0x37, 0xF5, 0x35, 0x34, 0xF4, 0x3C,
		0xFC, 0xFD, 0x3D, 0xFF, 0x3F, 0x3E, 0xFE, 0xFA, 0x3A, 0x3B, 0xFB, 0x39,
		0xF9, 0xF8, 0x38, 0x28, 0xE8, 0xE9, 0x29, 0xEB, 0x2B, 0x2A, 0xEA, 0xEE,
		0x2E, 0x2F, 0xEF, 0x2D, 0xED, 0xEC, 0x2C, 0xE4, 0x24, 0x25, 0xE5, 0x27,
		0xE7, 0xE6, 0x26, 0x22, 0xE2, 0xE3, 0x23, 0xE1, 0x21, 0x20, 0xE0, 0xA0,
		0x60, 0x61, 0xA1, 0x63, 0xA3, 0xA2, 0x62, 0x66, 0xA6, 0xA7, 0x67, 0xA5,
		0x65, 0x64, 0xA4, 0x6C, 0xAC, 0xAD, 0x6D, 0xAF, 0x6F, 0x6E, 0xAE, 0xAA,
		0x6A, 0x6B, 0xAB, 0x69, 0xA9, 0xA8, 0x68, 0x78, 0xB8, 0xB9, 0x79, 0xBB,
		0x7B, 0x7A, 0xBA, 0xBE, 0x7E, 0x7F, 0xBF, 0x7D, 0xBD, 0xBC, 0x7C, 0xB4,
		0x74, 0x75, 0xB5, 0x77, 0xB7, 0xB6, 0x76, 0x72, 0xB2, 0xB3, 0x73, 0xB1,
		0x71, 0x70, 0xB0, 0x50, 0x90, 0x91, 0x51, 0x93, 0x53, 0x52, 0x92, 0x96,
		0x56, 0x57, 0x97, 0x55, 0x95, 0x94, 0x54, 0x9C, 0x5C, 0x5D, 0x9D, 0x5F,
		0x9F, 0x9E, 0x5E, 0x5A, 0x9A, 0x9B, 0x5B, 0x99, 0x59, 0x58, 0x98, 0x88,
		0x48, 0x49, 0x89, 0x4B, 0x8B, 0x8A, 0x4A, 0x4E, 0x8E, 0x8F, 0x4F, 0x8D,
		0x4D, 0x4C, 0x8C, 0x44, 0x84, 0x85, 0x45, 0x87, 0x47, 0x46, 0x86, 0x82,
		0x42, 0x43, 0x83, 0x41, 0x81, 0x80, 0x40);

// USHORT
// usMBCRC16( UCHAR * pucFrame, USHORT usLen )
// {
// UCHAR ucCRCHi = 0xFF;
// UCHAR ucCRCLo = 0xFF;
// int iIndex;
//
// while( usLen-- )
// {
// iIndex = ucCRCLo ^ *( pucFrame++ );
// ucCRCLo = ( UCHAR )( ucCRCHi ^ aucCRCHi[iIndex] );
// ucCRCHi = aucCRCLo[iIndex];
// }
// return ( USHORT )( ucCRCHi << 8 | ucCRCLo );
// }

function modbusCRC16(data) {
	var ucCRCHi = 0xFF;
	var ucCRCLo = 0xFF;
	var index;

	for (var i = 0, len = data.length; i < len; i++) {
		index = ucCRCLo ^ data[i];
		index &= 0xff;
		ucCRCLo = ucCRCHi ^ aucCRCHi[index];
		ucCRCLo &= 0xff;
		ucCRCHi = aucCRCLo[index];
		ucCRCHi &= 0xff;
	}

	return ((ucCRCHi << 8) | ucCRCLo) & 0xffff;
}

function start() {
	if (timer == null) {
		host = $("#host").val();
		port = $("#port").val();
		deviceAddress = $("#device-address").val();
		functionCode = $("#select-choice-function-code").val();
		registerAddress = $("#register-address").val();
		registerQuantity = $("#register-quantity").val();

		request = new Array();
		request[0] = Number(deviceAddress) & 0xff;
		request[1] = Number(functionCode) & 0xff;
		request[2] = (Number(registerAddress) >> 8) & 0xff;
		request[3] = Number(registerAddress) & 0xff;
		request[4] = (Number(registerQuantity) >> 8) & 0xff;
		request[5] = Number(registerQuantity) & 0xff;
		var crc16 = modbusCRC16(request);
		request[6] = crc16 & 0xff;
		request[7] = (crc16 >> 8) & 0xff;

		request = byteArrayToHex(request);
		request = request.toUpperCase();
		requestHTML = '<span class="mb-dev-addr">' + request.substring(0, 2)
				+ '</span>';
		requestHTML += '<span class="mb-func-code">' + request.substring(2, 4)
				+ '</span>';
		requestHTML += '<span class="mb-reg-addr">' + request.substring(4, 8)
				+ '</span>';
		requestHTML += '<span class="mb-reg-quantity">'
				+ request.substring(8, 12) + '</span>';
		requestHTML += '<span class="mb-crc">' + request.substring(12, 16)
				+ '</span>';

		modbusUrl = 'http://' + host + ':' + port + '/modbus?request=' + request;
        
        switch(displayType) {
            case "data-int-16":
                dataQuantity = Number(registerQuantity);
                addData = addDataInt16;
                break;
            case "data-int-32":
                dataQuantity = Number(registerQuantity) / 2;
                addData = addDataInt32;
                break;
            case "data-float":
                dataQuantity = Number(registerQuantity) / 2;
                addData = addDataFloat;
                break;
            default:
                dataQuantity = 0;
                
        }
        
        var i;
        var listview = $('#listview-data');
        listview.empty();
        for(i = 0; i < dataQuantity; i++) {
            listview.append('<li>0</li>');
        }
        
        if(displayType != 'traffic') {
            setTimeout(function(){
                $('#listview-data').listview('refresh');
            }, 100);
        }
        

		$.ajaxSetup({
			timeout : 800
		});
		modbusTraffic();
	}
}

function stop() {
	if (timer != null) {
		clearTimeout(timer);
		timer = null;
	}
}

function clear() {
	$("#listview-traffic").empty();
	countTotal = 0;
	countSuccess = 0;
    $('#traffic-count').html(
        'Success ' + countSuccess + ' / Total ' + countTotal);
}

$(document).ready(function() {
	$("#btn-start").click(function() {
        displayType = $("#select-choice-display-type").val();
        if(displayType == "traffic") {
		  location.assign('#page-traffic');
        } else {
            location.assign('#page-data');
        }
		start();
	});

    function back(){
 		stop();
		location.assign('#page-setting');       
    }
	$("#btn-back").click(back);
    $("#page-data-btn-back").click(back);

	$("#traffic-start").click(function() {
		start();
	});

	$("#traffic-stop").click(function() {
		stop();
	});

	$("#traffic-auto-scroll").click(function() {
		trafficAutoScroll = !trafficAutoScroll;
		if (trafficAutoScroll) {
			window.scrollBy(0, Number.POSITIVE_INFINITY);
		}
	});

	$("#traffic-clear").click(function() {
		clear();
	});

});
