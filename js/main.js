var furgovw = {};

(function($) {
    
    console.log('furgovw: Homepage loaded...');

    document.addEventListener("deviceready", function() {

        console.log('furgovw: Device ready...');
            
        $('#fvw_logo').on('click', function() {
            furgovw.main();
        });

        furgovw.main();
            
    }, true);

    furgovw.main = function() {
    
        console.log("Connection: " + navigator.network.connection.type);

        //If there's no internet connection
        if (navigator.network.connection.type == 'none') {
            popErrorMessage('Lo siento, esta aplicaci&oacute;n necesita que tengas conexi&oacute;n a internet');
            return;
        }
        
        furgovw.geocoder = new google.maps.Geocoder();

        //Get user location
        navigator.geolocation.getCurrentPosition(
            function(p) {
                furgovw.userLatitude    = p.coords.latitude;
                furgovw.userLongitude   = p.coords.longitude;
                furgovw.latLng          = new google.maps.LatLng(
                    p.coords.latitude,
                    p.coords.longitude
                );
                    
                if (furgovw.geocoder) {
                    furgovw.geocoder.geocode({'latLng': furgovw.latLng}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var reverse_geo = results[1];
                                $('#fvw_user_location_button span span').html(
                                    reverse_geo.address_components[0].long_name +
                                    ', ' +
                                    reverse_geo.address_components[1].long_name +
                                    '<br>-Ver furgoperfectos-'
                                );
                            }
                        }
                    });
                }
                
                furgovw.loadSpots();
                $('a#fvw_user_location_button').attr('href', '#spots-list');
            },
            function() {
                popErrorMessage('Lo siento, no consigo encontrar tu localizaci&oacute;n');
            }
        );
    };

    furgovw.loadSpots = function() {

        $('#spots_list_list').empty();

        console.log('furgovw: Loading data from api http://www.furgovw.org/api.php?latitude=' + furgovw.userLatitude + '&longitude=' + furgovw.userLongitude);
        
        $.ajaxSetup({ scriptCharset: "utf-8" , contentType: "application/json; charset=utf-8"});
        $.getJSON('http://www.furgovw.org/api.php?latitude=' + furgovw.userLatitude + '&longitude=' + furgovw.userLongitude,
            function(spots) {
                console.log('furgovw: Loaded data from api');
                furgovw.spots = spots;
                
                $.each(spots, function(index, spot) {
                    $('#spots_list_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' +
                            '">' +
                            '<h3>' + spot.nombre + '</h3>' +
                            '<p>' + parseFloat(spot.distance).toFixed(1) + ' kms</p>' +
                            '<img class="spots_list_picture" src="' +
                            spot.imagen +
                            '"></a></li>');
                });
                
                $('#spots_list_list').listview('refresh', true);
                $('#fvw_user_location_button').attr('href', '#spots-list');
            })
            .error(function() {
                popErrorMessage('Lo siento, parece que hay un problema con la conexi&oacute;n a furgovw.org');
                return;
            });
    };

    furgovw.fillDetailPage = function(id) {
        furgovw.id = id;
        $.each(furgovw.spots, function(index, spot) {
            if (spot.id == furgovw.id) {
                $('img#fvw_spot_picture').attr('src', spot.imagen);
                $('#fvw_spot_name').text(spot.nombre);
                $('#fvw_spot_distance').text(parseFloat(spot.distance).toFixed(1) + ' kms');
                if (spot.link) {
                    $('a#fvw_spot_forum_link').attr('href', spot.link);
                    $('a#fvw_spot_forum_link').show();
                } else
                    $('a#fvw_spot_forum_link').hide();
                $('a#fvw_spot_forum_link span span').html('Enlace al foro');
                $('p#fvw_spot_author').html('Autor: <strong>' + spot.autor + '</strong>');
                $('p#fvw_spot_msg_body').html(spot.body);
            }
        });
    };

    function popErrorMessage(errorMessage){
     
        $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>" + errorMessage  + "</h1></div>")
            .css({ "display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100 })
            .appendTo( $.mobile.pageContainer )
            .delay( 2000 )
            .fadeOut( 400, function(){
                $(this).remove();
            }
        );

    }

})(jQuery);
