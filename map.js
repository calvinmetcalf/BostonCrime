var m,d;
var g = google.maps;
var zoom = 12;
var center = new g.LatLng(42.33,-71.067467);
var geocoder = new g.Geocoder();
geocoder.marker = new g.Marker();
var oURL = 'http://xdr-cwm.rhcloud.com/crime';
var infowindow = new g.InfoWindow();



var bosFT = new LCC({
semi_major: 6378137,
inverse_flattening: 298.257222101,
standard_parallel_1: 41 + (43/60),
standard_parallel_2: 42 + (41/60),
central_meridian: -71.5,
latitude_of_origin: 41,
false_easting: 656166.6666666665,
false_northing: 2460625,
unit: 0.3048006096012192
});


$(function() {
    $( "#tabs" ).tabs({
            collapsible: true,
            selected: -1
		});
        $( ".datepicker" ).datepicker();
         $('input, textarea').placeholder();
  m = new g.Map(document.getElementById('map'), {
      center: center,
      zoom: zoom,
      mapTypeId: 'roadmap'
    });
getStuff(oURL);
 $('.datepicker').change(function(){
     var now = new Date();
 var datef = $('#from').val().split("/");
  var datet = $('#to').val().split("/");
  if (datef.length==1){
   datef = ["01","01","1900"];
  }
   if (datet.length==1){
   datet = [now.getMonth()+1,now.getDate(),now.getFullYear()];
  }
 var from = new Date(parseInt(datef[2]),parseInt(datef[0])-1,parseInt(datef[1]));
  var to = new Date(parseInt(datet[2]),parseInt(datet[0])-1,parseInt(datet[1]));
 $.each(d,function(i,s){
     if((s.dd<from)||(s.dd>to)){
      s.marker.setMap(null);   
     }
     if((s.dd>from)&&(s.dd<to)){
      s.marker.setMap(m);   
     }
 });
});

$('#geocode').click(function(){
    geocoder.geocode( { 'address': $("#address").val()}, function(results, status) {
      if (status == g.GeocoderStatus.OK) {
        m.setCenter(results[0].geometry.location);
        m.setZoom(14);
         geocoder.marker.setPosition(results[0].geometry.location);
   geocoder.marker.setMap(m);
           
     
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}
);

$('#resetgeo').click(function(){
      m.setCenter(center);
    m.setZoom(zoom);
geocoder.marker.setMap(null);
});
}
);

var doStuff =  function(data){
    d = data.INCIDENT;
    $.each(d,function(i,s){
          var x = s.X;
          var y = s.Y;
          var ccd = s.CRIMECODE_DESC;
         var fccd = s.FINALCRIMECODEDESC; 
          var stb = s.STREETNAME; 
          var ta = s.FROMDATE.split("-");
          var tb = ta[2].split('T');
          var tc = tb[1].split(":");
        
           s.dd = new Date(parseInt(ta[0]), parseInt(ta[1])-1,parseInt(tb[0]),parseInt(tc[0]),parseInt(tc[1]),parseInt(tc[2]));
        var icon  = new g.MarkerImage("http://xdr-cwm.rhcloud.com/smallgreen.png");
          
          
      
        var latlng = bosFT.inverse([x,y]);
       var content = 'Crime Type: ' + ccd + '<br/>Final Crime Type: ' + fccd + '<br/>Location ' + stb + '<br/>When: ' + s.dd;
          s.marker = new g.Marker({position: new g.LatLng(latlng[1],latlng[0]),title:fccd,icon:icon});
        
         s.marker.setMap(m)
        g.event.addListener(s.marker, 'click',
                			function()
							{
                                infowindow.setContent(content);
                              infowindow.open(m,s.marker);
							});
     
      
    });
          
     
};


var getStuff = function(url){
 $.get(url,
function(data){
    
    doStuff(data);
}, 'JSONP');   
}

function LCC(params){
    /*
    based off http://gmaps-utility-gis.googlecode.com/svn/trunk/v3samples/customprojection.html
    */

                                                /*=========parameters=================*/

                                                params=params||{};

                                            	this.name=params.name||"LCC";

                                        		var _a = (params.semi_major ||6378137.0 )/(params.unit||0.3048006096012192);

                                        		var _f_i=params.inverse_flattening||298.257222101;//this.

                                        		var _phi1 = (params.standard_parallel_1||34.33333333333334) * (Math.PI / 180);

                                        		var _phi2 = (params.standard_parallel_2||36.16666666666666) * (Math.PI / 180);

                                        		var _phiF = (params.latitude_of_origin||33.75) * (Math.PI / 180);

                                        		var _lamdaF = (params.central_meridian||-79.0)* (Math.PI / 180);

                                        		var _FE = params.false_easting||2000000.002616666;//this.

                                        		var _FN = params.false_northing||0.0;//this.

                                        		/*========== functions to calc values, potentially can move outside as static methods=========*/

                                        		var calc_m = function(phi, es){

                                            		var sinphi = Math.sin(phi);

                                             		return Math.cos(phi) / Math.sqrt(1 - es * sinphi * sinphi);

                                        		};

                                        		var calc_t = function(phi, e){

                                            		var esinphi = e * Math.sin(phi);

                                            		return Math.tan(Math.PI / 4 - phi / 2) / Math.pow((1 - esinphi) / (1 + esinphi), e / 2);

                                        		};

                                        		var calc_r = function(a, F, t, n){

                                            		return a * F * Math.pow(t, n)

                                        		};

                                        		var calc_phi = function(t_i, e, phi){

                                            		var esinphi = e * Math.sin(phi);

                                           			return Math.PI / 2 - 2 * Math.atan(t_i * Math.pow((1 - esinphi) / (1 + esinphi), e / 2));

                                        		};

                                        

                                        		var solve_phi = function(t_i, e, init){

                                            		// iteration

                                           			 var i = 0;

                                            		var phi = init;

                                            		var newphi = calc_phi(t_i, e, phi);//this.

                                            		while (Math.abs(newphi - phi) > 0.000000001 && i < 10) {

                                                			i++;

                                                			phi = newphi;

                                                			newphi = calc_phi(t_i, e, phi);//this.

                                            		}

                                            		return newphi;

                                        		}

                                    

                                    		/*=========shared, not point specific params or intermediate values========*/

                                        		var _f = 1.0 /_f_i;//this.

                                        		/*e: eccentricity of the ellipsoid where e^2 = 2f - f^2 */

                                        		var _es = 2 * _f - _f * _f;

                                        		var _e = Math.sqrt(_es);

                                        		var _m1 = calc_m(_phi1, _es);//this.

                                        		var _m2 = calc_m(_phi2, _es);//this.

                                        		var _tF = calc_t(_phiF, _e);//this.

                                        		var _t1 = calc_t(_phi1, _e);//this.

                                        		var _t2 = calc_t(_phi2, _e);//this.

                                        		var _n = Math.log(_m1 / _m2) / Math.log(_t1 / _t2);

                                        		var _F = _m1 / (_n * Math.pow(_t1, _n));

                                        		var _rF = calc_r(_a, _F, _tF, _n);//this.

                                        

                                           /**

                                            * convert lat lng to coordinates 

                                            * @param {Array<double>} latlng array with 2 double: [lat,lng]

                                            * @return {Array<double>} coords array with 2 double: [x,y]

                                            */

                                        		this.forward = function(lnglat){

                                            		var phi = lnglat[1] * (Math.PI / 180);

                                            		var lamda = lnglat[0] * (Math.PI / 180);

                                            		var t = calc_t(phi, _e);//this.

                                            		var r = calc_r(_a, _F, t, _n);//this.

                                            		var theta = _n * (lamda - _lamdaF);

                                            		var E = _FE + r * Math.sin(theta);

                                            		var N = _FN + _rF - r * Math.cos(theta);

                                            		return [E, N];

                                        		};

                                        	 /**

                                            * convert  coordinates to lat lng 

                                            * @param  {Array<double>} coords array with 2 double: [x,y]

                                            * @return {Array<double>} latlng array with 2 double: [lat,lng]

                                            */

                                          	this.inverse = function(xy){

                                            		var E = xy[0];

                                            		var N = xy[1];

                                            		var theta_i = Math.atan((E - _FE) / (_rF - (N - _FN)));

                                            		var r_i = (_n > 0 ? 1 : -1) * Math.sqrt((E - _FE) * (E - _FE) + (_rF - (N - _FN)) * (_rF - (N - _FN)));

                                            		var t_i = Math.pow((r_i / (_a * _F)), 1 / _n);

                                            		var phi = solve_phi(t_i, _e, 0);//this.

                                            		var lamda = theta_i / _n + _lamdaF;

                                            		return  [lamda * (180 / Math.PI),phi * (180 / Math.PI)];

                                        		};

                                            /**

                                             * circum of earth in projected units. This is used in V2's wrap.

                                             * @return double.

                                             */

                                        		this.circum = function(){

                                            		return Math.PI * 2 * _a;

                                        		};

                                        

                                    	}


                        
