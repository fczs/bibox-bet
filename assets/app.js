(function (window, document, $) {
    var inputs = {}, 
        bibox = {}, 
        pinnacle = {}, 
        update,
        $ct = $('.countdown span'),
        $update = $('.countdown a');

    $(document).on('change', '.form-control', function () {
        var $card = $(this).parents('.card'),
            card = $card.attr('id'),
            odd = $(this).data('odd'),
            value = $(this).val() === '' ? 0 : parseInt($(this).val()),
            index = card.substring(4),
            sum = bibox[index].x1 + bibox[index].x2 + bibox[index].draw;
            
        if (typeof inputs[card] === 'undefined') {
            inputs[card] = {'x1': 0, 'draw': 0, 'x2': 0};
        }
        
        inputs[card][odd] = value;
        sum += inputs[card].x1 + inputs[card].x2 + inputs[card].draw;
        $card.find('.biboxer').each(function () {
            var divider = inputs[card][$(this).data('odd')] + bibox[index][$(this).data('odd')];
            $(this).text((Math.round(sum / divider * 100) / 100).toFixed(2));
        });
        
        markOdds(index);
    });

    function updateBibox() {
        $.post('/ajax/bib.php', {}, function (response) {
            response = JSON.parse(response);
            if (!$.isEmptyObject(response)) {
                bibox = response;

                if (bibox.hasOwnProperty('error')) {
                    console.log(bibox.error);
                    return;
                }

                $('#table').html('');
                $.each(response, function (index, value) {
                    var v_x1 = '', v_x2 = '', v_draw = '',
                        value_x1 = value.x1,
                        value_x2 = value.x2,
                        value_draw = value.draw,
                        sum = value_x1 + value_draw + value_x2,
                        card = 'card' + index;

                    if ($.isEmptyObject(pinnacle[index])) {
                        updatePinnacle(index);
                    }

                    if (card in inputs) {
                        v_x1 = 'x1' in inputs[card] ? (inputs[card].x1 !== 0 ? inputs[card].x1 : '') : '';
                        v_x2 = 'x2' in inputs[card] ? (inputs[card].x2 !== 0 ? inputs[card].x2 : '') : '';
                        v_draw = 'draw' in inputs[card] ? (inputs[card].draw !== 0 ? inputs[card].draw : '') : '';
                    }

                    if (v_x1 !== '') {
                        sum += v_x1;
                        value_x1 += v_x1;
                    }

                    if (v_x2 !== '') {
                        sum += v_x2;
                        value_x2 += v_x2;
                    }

                    if (v_draw !== '') {
                        sum += v_draw;
                        value_draw += v_draw;
                    }

                    $('#table').append('<div class="col-sm-6"><div class="card mb-4" id="card' + index + '"><div class="card-body">'
                        + '<div class="titles mb-4">'
                        + '<h5 class="card-title">' + value.country1 + '</h5>'
                        + '<p class="card-text">' + value.date + '</p>'
                        + '<h5 class="card-title">' + value.country2 + '</h5>'
                        + '</div>'
                        + '<div class="bibox mb-3">'
                        + '<span class="badge badge-secondary biboxer x1" data-odd="x1">' + (Math.round(sum / value_x1 * 100) / 100).toFixed(2) + '</span>'
                        + '<span class="badge badge-secondary biboxer draw" data-odd="draw">' + (Math.round(sum / value_draw * 100) / 100).toFixed(2) + '</span>'
                        + '<span class="badge badge-secondary biboxer x2" data-odd="x2">' + (Math.round(sum / value_x2 * 100) / 100).toFixed(2) + '</span>'
                        + '</div>'
                        + '<div class="pinnacle mb-4">'
                        + '<span class="badge badge-secondary pinnacler x1">' + (index in pinnacle ? ('x1' in pinnacle[index] ? pinnacle[index].x1 : 0) : 0) + '</span>'
                        + '<span class="badge badge-secondary pinnacler draw">' + (index in pinnacle ? ('draw' in pinnacle[index] ? pinnacle[index].draw : 0) : 0) + '</span>'
                        + '<span class="badge badge-secondary pinnacler x2">' + (index in pinnacle ? ('x2' in pinnacle[index] ? pinnacle[index].x2 : 0) : 0) + '<span>'
                        + '</div>'
                        + '<div class="bid">'
                        + '<div class="form-group mx-sm-3 mb-2">'
                        + '<input type="text" class="form-control x1" data-odd="x1" placeholder="x1" value="' + v_x1 + '">'
                        + '</div>'
                        + '<div class="form-group mx-sm-3 mb-2">'
                        + '<input type="text" class="form-control draw" data-odd="draw" placeholder="draw" value="' + v_draw + '">'
                        + '</div>'
                        + '<div class="form-group mx-sm-3 mb-2">'
                        + '<input type="text" class="form-control x2" data-odd="x2" placeholder="x2" value="' + v_x2 + '">'
                        + '</div></div>'
                        + '<div class="pinnacle mt-3"><a href="#" data-index="' + index + '">Update pinnacle line</a></div>'
                        + '</div></div></div>');

                    markOdds(index);
                });

                $ct.text('0');
            }
        });
    }

    function updatePinnacle(index) {
        $.post('/ajax/pin.php', {'country1': bibox[index].country1, 'country2': bibox[index].country2}, function (response) {
            var $card = $('#card' + index);
            response = JSON.parse(response);
            pinnacle[index] = response;

            if (response.hasOwnProperty('error')) {
                console.log(response.error);
                return;
            }

            $card.find('.pinnacler.x1').text(pinnacle[index].x1);
            $card.find('.pinnacler.x2').text(pinnacle[index].x2);
            $card.find('.pinnacler.draw').text(pinnacle[index].draw);
            markOdds(index);
        });
    }

    function loadUpdate() {
        $ct.html('<div class="loader"></div>');
        updateBibox();
    }

    function setUpdate() {
        update = setInterval(function(){
            loadUpdate();
        },15000);
    }

    function markOdds(index) {
        var $card = $('#card' + index),
            $x1 = $card.find('.biboxer.x1'),
            $x2 = $card.find('.biboxer.x2'),
            $draw = $card.find('.biboxer.draw');

        if ($.isEmptyObject(pinnacle[index])) return;

        $x1.removeClassesByMask('badge-*');
        $x2.removeClassesByMask('badge-*');
        $draw.removeClassesByMask('badge-*');

        if (parseFloat($x1.text()) / pinnacle[index].x1 >= 1.2) {
            $x1.addClass('badge-success');
        } else if (parseFloat($x1.text()) / pinnacle[index].x1 > 1) {
            $x1.addClass('badge-warning');
        } else {
            $x1.addClass('badge-danger');
        }

        if (parseFloat($x2.text()) / pinnacle[index].x2 >= 1.2) {
            $x2.addClass('badge-success');
        } else if (parseFloat($x2.text()) / pinnacle[index].x2 > 1) {
            $x2.addClass('badge-warning');
        } else {
            $x2.addClass('badge-danger');
        }

        if (parseFloat($draw.text()) / pinnacle[index].draw >= 1.2) {
            $draw.addClass('badge-success');
        } else if (parseFloat($draw.text()) / pinnacle[index].draw > 1) {
            $draw.addClass('badge-warning');
        } else {
            $draw.addClass('badge-danger');
        }
    }

    updateBibox();
    setUpdate();

    setInterval(function(){
        var ct = $ct.text();
        if (ct !== '' && typeof parseInt(ct) === 'number') {
            $ct.text(parseInt(ct) +1);
        }
    },1000);

    $update.on('click', function (e) {
        e.preventDefault();
        clearInterval(update);
        loadUpdate();
        setUpdate();
    });

    $(document).on('click', '.pinnacle a', function (e) {
        e.preventDefault();
        updatePinnacle($(this).data('index'));
    });

    $.fn.removeClassesByMask = function (mask) {
        this.removeClass(function (index, className) {
            var re = mask.replace(/\*/g, '\\S+');
            return (className.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
        });
    };

})(window, document, jQuery);