#include "IAfrService.h"

namespace ApplicationService
{
	void IAfrService::CalculateAfrCallBack(void *afrService)
	{
		((IAfrService*)afrService)->CalculateAfr();
	}
}