// (function ($) {
//     "use strict";

//     /* Sale and Orders Chart */
//     if ($('#myChart').length) {
//         var ctx = document.getElementById('myChart').getContext('2d');
//         var chart = new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//                 datasets: [{
//                         label: 'Sales',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(44, 120, 220, 0.2)',
//                         borderColor: 'rgba(44, 120, 220)',
//                         data: [18, 17, 4, 3, 2, 20, 25, 31, 25, 22, 20, 9]
//                     },
//                     {
//                         label: 'Orders',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(4, 209, 130, 0.2)',
//                         borderColor: 'rgb(4, 209, 130)',
//                         data: [40, 20, 17, 9, 23, 35, 39, 30, 34, 25, 27, 17]
//                     }
//                 ]
//             },
//             options: {
//                 plugins: {
//                     legend: {
//                         labels: {
//                             usePointStyle: true,
//                         },
//                     },
//                 },
//             },
//         });
//     } // End if

//     /* Sales and Orders Bar Chart */
//     if ($('#myChart2').length) {
//         var ctx2 = document.getElementById('myChart2').getContext('2d');
//         var myChart2 = new Chart(ctx2, {
//             type: 'bar',
//             data: {
//                 labels: ["900", "1200", "1400", "1600"],
//                 datasets: [
//                     {
//                         label: "Sales",
//                         backgroundColor: "#5897fb",
//                         barThickness: 10,
//                         data: [233, 321, 783, 900]
//                     },
//                     {
//                         label: "Orders",
//                         backgroundColor: "#7bcf86",
//                         barThickness: 10,
//                         data: [408, 547, 675, 734]
//                     },
//                 ],
//             },
//             options: {
//                 plugins: {
//                     legend: {
//                         labels: {
//                             usePointStyle: true,
//                         },
//                     },
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                     },
//                 },
//             },
//         });
//     } // End if

// })(jQuery);
