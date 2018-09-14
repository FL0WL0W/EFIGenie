#include "EngineManagementServices/AfrService/IAfrService.h"

namespace EngineManagementServices
{
	void IAfrService::CalculateAfrCallBack(void *afrService)
	{
		((IAfrService*)afrService)->CalculateAfr();
	}
}