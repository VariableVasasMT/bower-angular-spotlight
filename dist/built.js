angular.module('de.stekoe.angular.spotlight', [])
    .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {

        const KEY = {
            UP: 38,
            DOWN: 40,
            SPACE: 32,
            ESC: 27,
            ENTER: 13
        };

        var $ngSpotlightOverlay;

        var controller = ['$scope', function ($scope) {
            $scope.searchInputInfo = 'Keine Ergebnisse';

            $scope.search = function () {
                if ($scope.searchTerm.length > 0) {
                    AngularSpotlight.search($scope.searchTerm)
                        .then(function setSearchResult(resp) {
                            $scope.searchResults = resp;
                            $scope.searchResultsCount = $scope.searchResults
                                .map(function (category) {
                                    return category.items.length;
                                })
                                .reduce(function (prev, cur) {
                                    return prev + cur;
                                }, 0);

                            selectItemAtIndex($scope.selectedItemIndex);
                        });
                }
            };

            $scope.getIconForType = function (type) {
                return AngularSpotlight.getIconForType(type);
            };

            $scope.showResultItem = function (categoryName, idx) {
                var indexToSelect = 0;

                for (var i = 0; i < $scope.searchResults.length; i++) {
                    if ($scope.searchResults[i].name !== categoryName) {
                        indexToSelect += $scope.searchResults[i].items.length;
                    } else {
                        break;
                    }
                }

                selectItemAtIndex(indexToSelect + idx);
            };

            /**
             * Handle Keyboard events
             * @param $event
             */
            $scope.handleKeyDown = function ($event) {
                switch ($event.keyCode) {
                    case KEY.UP:
                        $event.preventDefault();
                        selectPreviousEntry();
                        break;
                    case KEY.DOWN:
                        $event.preventDefault();
                        selectNextEntry();
                        break;
                    case KEY.ESC:
                        resetSearch();
                        break;
                    case KEY.ENTER:
                        alert($scope.selectedItem.name);
                        break;
                }
            };

            $scope.openResultItem = function() {
                alert($scope.selectedItem.name);
            };


            function resetSearch() {
                $scope.selectedItem = undefined;
                $scope.searchResultsCount = 0;
                $scope.searchResults = [];
                $scope.searchInputInfo = undefined;
                $scope.searchTerm = "";
            }

            function selectPreviousEntry() {
                var idx = getSelectedItemIndex();
                if (idx - 1 >= 0) {
                    selectItemAtIndex(idx - 1)
                }
            }

            function selectNextEntry() {
                var idx = getSelectedItemIndex();
                if (idx + 1 < $scope.searchResultsCount) {
                    selectItemAtIndex(idx + 1);
                }
            }

            function selectItemAtIndex(idx) {
                var currentItemIndex = 0;
                $scope.searchResults.forEach(function (category) {
                    if (category.items.length > 0) {
                        category.items.forEach(function (item) {
                            var isActive = currentItemIndex === (idx || 0);
                            item.active = isActive;
                            currentItemIndex++;

                            if (isActive) {
                                $scope.selectedItem = item;
                                setSearchInputInfo(category.name);
                            }
                        });
                    }
                });
                $scope.selectedItemIndex = idx;
            }

            function setSearchInputInfo(categoryName) {
                $scope.searchInputInfo = undefined;
                if ($scope.searchTerm.length === 0) {
                    $scope.searchInputInfo = undefined;
                } else {
                    if ($scope.selectedItem) {
                        $scope.searchInputInfo = $scope.selectedItem.name + " - " + categoryName;
                    } else if ($scope.searchResultCount() === 0) {
                        $scope.searchInputInfo = "Keine Ergebnisse";
                    }
                }
            }

            function getSelectedItemIndex() {
                return $scope.selectedItemIndex || 0;
            }

            $scope.$watch('selectedItemIndex', function () {
                $timeout(function () {
                    if ($scope.selectedItemIndex !== undefined) {
                        keepItemVisible();
                    }
                }, 100);
            });

            function keepItemVisible() {
                var activeItem = $ngSpotlightOverlay.find('li.ng-spotlight-results-list-item.active');
                var resultsList = $ngSpotlightOverlay.find('.ng-spotlight-results-list');

                var activeItemTop = activeItem.position().top;
                var activeItemBottom = activeItem.position().top + activeItem.outerHeight();
                var parentsHeight = resultsList.height();
                var currentScrollTop = resultsList.scrollTop();

                if (parentsHeight - activeItemBottom < 0) {
                    resultsList.scrollTop(currentScrollTop + Math.abs(parentsHeight - activeItemBottom));
                }
                if (activeItemTop < 0) {
                    var padding = 0;
                    if (activeItem.parent().find('li').index(activeItem) === 0) {
                        padding = $('.ng-spotlight-results-list-header:first').outerHeight();
                    }
                    resultsList.scrollTop(currentScrollTop + activeItemTop - padding);
                }
            }
        }];

        function linkFn(scope, element) {
            var spotlightOverlay = $(element).children();
            $ngSpotlightOverlay = $(element);

            $('[data-toggle="ng-spotlight"]').on('click', function(e) {
                e.stopPropagation();
                toggleOverlay();
            });

            $(document).click(function (e) {
                if ($(e.target).closest('.ng-spotlight').length === 0) {
                    spotlightOverlay.hide();
                } else {
                    spotlightOverlay
                        .find('input')
                        .focus();
                }
            });

            $(document).keydown(function (e) {
                if (e.ctrlKey && e.keyCode === KEY.SPACE) {
                    e.preventDefault();
                    toggleOverlay();
                }
            });

            function toggleOverlay() {
                spotlightOverlay.toggle();
                if (spotlightOverlay.is(':visible')) {
                    spotlightOverlay.find('input')
                        .focus()
                        .select();
                }
            }

            $ngSpotlightOverlay.find('.ng-spotlight-input').autoGrowInput({
                maxWidth: 400,
                minWidth: 10,
                comfortZone: 15
            });
        }

        return {
            restrict: 'E',
            controller: controller,
            link: linkFn,
            templateUrl: 'spotlightOverlayTemplate.html'
        };
    }]);;angular.module('de.stekoe.angular.spotlight')
    .provider("AngularSpotlight", function () {
        var _iconConfig = iconConfig();
        var _detailsTemplateConfig = detailsTemplateConfig();

        this.search = function () {
            throw "You have to implement a search function using AngularSpotlightProvider!";
        };

        this.addIcons = _iconConfig.addIcons;
        this.addTemplates = _detailsTemplateConfig.addTemplates;

        this.$get = ['$http', function ($http) {
            var that = this;
            return {
                search: that.search($http),
                getIconDescriptorForType: _iconConfig.getIconForType,
                getTemplateForType: _detailsTemplateConfig.getTemplateForType
            };
        }];

        function iconConfig() {
            var icons = {
                'default': 'fa fa-file'
            };

            function addIcons(iconDescriptors) {
                Object.keys(iconDescriptors)
                    .forEach(function (iconKey) {
                        icons[iconKey.toLowerCase()] = iconDescriptors[iconKey];
                    });
            }

            function getIconForType(type) {
                var icon = icons[(type || 'default').toLowerCase()] || icons['default'];

                return {
                    data: icon,
                    type: guessType(icon)
                };

                function guessType(icon) {
                    var icon = icon.toLowerCase();
                    if (icon.indexOf('http') === 0 || icon.indexOf('data:') === 0) {
                        return 'url';
                    } else {
                        return 'css';
                    }
                }
            }

            return {
                addIcons: addIcons,
                getIconForType: getIconForType
            }
        }

        function detailsTemplateConfig() {
            var detailsTemplates = {
                'default': '<div class="ng-spotlight-results-detail-default"><spotlight-result-icon selected-item="selectedItem"></spotlight-result-icon><div class="name">{{selectedItem.name}}</div></div>'
            };

            function addTemplates(templateDescriptors) {
                Object.keys(templateDescriptors)
                    .forEach(function (templateKey) {
                        detailsTemplates[templateKey.toLowerCase()] = templateDescriptors[templateKey];
                    });
            }

            function getTemplateForType(type) {
                return detailsTemplates[(type || 'default').toLowerCase()] || detailsTemplates['default'];
            }

            return {
                addTemplates: addTemplates,
                getTemplateForType: getTemplateForType
            }
        }
    });
;angular.module('de.stekoe.angular.spotlight')
    .directive('spotlightDetails', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        return {
            restrict: "E",
            link: function (scope, element) {
                scope.$watch('selectedItem', function () {
                    if (scope.selectedItem) {
                        element.html(AngularSpotlight.getTemplateForType(scope.selectedItem.type)).show();
                        $compile(element.contents())(scope);
                    }
                });
            }
        };
    }]);;angular.module('de.stekoe.angular.spotlight').run(['$templateCache', function($templateCache) {
    $templateCache.put('spotlightOverlayTemplate.html',
        "<div class=\"ng-spotlight ng-spotlight-overlay\" ng-keydown=\"handleKeyDown($event)\">\n    <div class=\"ng-spotlight-searchbar\">\n        <div class=\"ng-spotlight-icon\">\n            <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"  viewBox=\"0 0 283.753 284.51\" enable-background=\"new 0 0 283.753 284.51\" xml:space=\"preserve\">\n            <path d=\"M281.394,264.378l0.135-0.135L176.24,158.954c30.127-38.643,27.45-94.566-8.09-130.104\n\tc-38.467-38.467-100.833-38.467-139.3,0c-38.467,38.467-38.466,100.833,0,139.299c35.279,35.279,90.644,38.179,129.254,8.748\n\tl103.859,103.859c0.01,0.01,0.021,0.021,0.03,0.03l1.495,1.495l0.134-0.134c2.083,1.481,4.624,2.36,7.375,2.36\n\tc7.045,0,12.756-5.711,12.756-12.756C283.753,269.002,282.875,266.462,281.394,264.378z M47.388,149.612\n\tc-28.228-28.229-28.229-73.996,0-102.225c28.228-28.229,73.996-28.228,102.225,0.001c28.229,28.229,28.229,73.995,0,102.224\n\tC121.385,177.841,75.617,177.841,47.388,149.612z\"/>\n            </svg>\n        </div>\n        <input class=\"ng-spotlight-input\" ng-class=\"{'empty': searchTerm.length === 0}\" type=\"text\" placeholder=\"Spotlight-Suche\" ng-model=\"searchTerm\" ng-change=\"search()\"/>\n\n        <div class=\"ng-spotlight-input-after\" ng-if=\"searchInputInfo.length > 0  && searchTerm.length > 0\">&mdash; {{searchInputInfo}}</div>\n        <div class=\"ng-spotlight-results-icon\">\n            <spotlight-result-icon selected-item=\"selectedItem\" ng-if=\"searchTerm.length > 0\"></spotlight-result-icon>\n        </div>\n    </div>\n    <div class=\"ng-spotlight-results-panel\" ng-if=\"searchTerm && searchTerm.length > 0 && searchResultsCount > 0\" >\n        <div class=\"ng-spotlight-results-list\" ng-keydown=\"handleKeyDown($event)\">\n            <ul>\n                <li class=\"ng-spotlight-results-category\" ng-repeat=\"searchResult in searchResults\">\n                    <div class=\"ng-spotlight-results-list-header\">{{searchResult.name}}</div>\n                    <ul>\n                        <li class=\"ng-spotlight-results-list-item\"\n                            ng-repeat=\"resultItem in searchResult.items\"\n                            ng-class=\"{'active': resultItem.active === true}\"\n                            ng-click=\"showResultItem(searchResult.name, $index)\"\n                            ng-dblclick=\"openResultItem()\">\n\n                            <spotlight-result-icon type=\"{{resultItem.type || 'default'}}\"></spotlight-result-icon>\n\n                            {{resultItem.name}}\n\n                            <span class=\"info\" ng-if=\"resultItem.info\">\n                                &ndash; {{resultItem.info}}\n                            </span>\n                        </li>\n                    </ul>\n                </li>\n            </ul>\n        </div>\n        <div class=\"ng-spotlight-results-detail\">\n            <spotlight-details></spotlight-details>\n        </div>\n    </div>\n</div>");
}]);;angular.module('de.stekoe.angular.spotlight')
    .directive('spotlightResultIcon', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        var iconTemplates = {
            'url': '<img class="ng-spotlight-item-icon" ng-src="{{iconDescriptor.data}}">',
            'css': '<div class="ng-spotlight-item-icon {{iconDescriptor.data}}"></div>'
        };

        return {
            restrict: "E",
            scope: {
                selectedItem: '='
            },
            link: function (scope, element, attrs) {
                if (attrs.type) {
                    updateResultIcon(AngularSpotlight.getIconDescriptorForType(attrs.type));
                } else {
                    scope.$watch('selectedItem', function () {
                        if (scope.selectedItem) {
                            updateResultIcon(AngularSpotlight.getIconDescriptorForType(scope.selectedItem.type));
                        } else {
                            element.html("");
                        }
                    })
                }

                function updateResultIcon(iconDescriptor) {
                    var iconTemplate = iconTemplates[iconDescriptor.type];
                    element.html(iconTemplate).show();
                    $compile(element.contents())(scope);
                    scope.iconDescriptor = iconDescriptor;
                }
            }
        }
    }]);