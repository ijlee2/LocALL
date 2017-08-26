$('.dropdown-toggle').dropdown("toggle");
function displayPage(page){
	$(".page").hide();
	$(".page:nth-of-type(" + (page + 1) + ")").show();
}

