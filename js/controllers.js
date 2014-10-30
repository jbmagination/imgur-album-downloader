function AlbumCtrl($scope, $routeParams, $http, $location, $window) {
    $scope.album = [];
    $scope.to_download = [];
    $scope.downloaded = 0;
    $scope.progress = 'progress';
    $scope.dl_link = '';
    $scope.albumid = $routeParams.albumid || '';

    $scope.$on('$viewContentLoaded', function(event) {
        $window._gaq.push(['_trackPageview', $location.path()]);
    });

    // Use CORS
    $http.defaults.useXDomain = true;
    delete $http.defaults.headers.common['X-Requested-With'];
    $http.get(
            'https://api.imgur.com/3/album/' + $scope.albumid, //i46pk',
            // client ids can't really be secured in javascript.
            // don't be a dick, get your own, they're free.
            {headers: {Authorization: 'Client-ID 5dc6065411ee2ab' }}
            ).success(function(data) {
                $scope.album = data.data;
            });

    $scope.update = function (albumid) {
        $location.path('/' + $scope.albumid);
    };

    $scope.select_all = function () {
        $scope.album.images.forEach(function (image) {
            image.selected = true;
        });
    };

    $scope.$watch('album', function () {
        if (!$scope.album.images) return;
        $scope.to_download = $scope.album.images.filter(function (val) {
            return val.selected;
        });
    }, function (old_val, new_val) { return true; });

    $scope.download = function () {
        $('#progress-modal').modal({
            keyboard: false,
            backdrop: false
        });
        $scope.downloaded = 0;
        var zip = new JSZip();
        $scope.to_download.forEach(function (image) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://i.imgur.com/' + image.id + '.jpg', true);
            xhr.responseType = 'arraybuffer';

            xhr.onreadystatechange = function(e) {
                if (this.readyState == 4 && this.status == 200) {
                    zip.file(image.id + '.jpg', this.response);
                    $scope.$apply(function ($scope) {
                        $scope.downloaded += 1;
                        $scope.progress = 'progress';
                        if ($scope.downloaded == $scope.to_download.length) {
                            $scope.progress = 'progress active striped';
                            var blob = zip.generate({type: 'blob'});
                            $scope.progress = 'progress';
                            $scope.dl_link = window.URL.createObjectURL(blob);
                            //location.href = window.URL.createObjectURL(blob);
                        }
                    });
                }
            };
            xhr.send();
        });
    };
}

function LandingCtrl($scope, $location, $window) {
    $scope.$on('$viewContentLoaded', function(event) {
        $window._gaq.push(['_trackPageview', $location.path()]);
    });

    $('#bookmarklet')
        .attr('href', 'javascript:' +
              "location.href=location.pathname.replace(/.*\\/gallery\\//,'" +
              location + "')")
        .bookmarkletHelperArrow({
            color: '#85bf25',
            zindex: 2000,
            pos: 800,
            lw: 4
        });
    $scope.update = function (albumid) {
        $location.path('/' + $scope.albumid);
    };
};
