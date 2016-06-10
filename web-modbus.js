var baudrate;
var timer;

function modbusTraffic() {
	var content = '				<li> \
					<p> \
						<strong>Read Input Registers 6 ~ 7 Success</strong> \
					</p> \
					<p> \
						-&gt;<span class="mb-dev-addr">08</span><span class="mb-func-code">03</span><span class="mb-reg-addr">0006</span><span class="mb-reg-quantity">0002</span><span class="mb-crc">FE</span> \
					</p> \
					<p> \
						&lt;-<span class="mb-dev-addr">08</span><span class="mb-func-code">03</span><span class="mb-reg-quantity">02</span><span class="mb-data">0356FE12</span><span class="mb-crc">FE</span> \
					</p> \
				</li>';
	$("#listview-traffic").append(content);
	$("#listview-traffic").listview('refresh');
	
	window.scroll(0, 68835);
	
	timer = setTimeout(modbusTraffic, 1000);
}

function start() {
	baudrate  = $("#select-choice-baudrate").val();
	location.assign('#page-traffic');
	modbusTraffic();
}

function stop() {
	clearTimeout(timer);
	location.assign('#page-web-modbus');
}


$(document).ready(function() {
	$("#btn-start").click(function () {
		start();
	});
	
	$("#btn-stop").click(function () {
		stop();
	});
	
	$("#add").click(function(){
		modbusTraffic();
	});
	
});
