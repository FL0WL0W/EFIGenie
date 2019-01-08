#include "EngineControlServices/AfrService/IAfrService.h"

namespace EngineControlServices
{
	void IAfrService::CalculateAfrCallBack(void *afrService)
	{
		((IAfrService*)afrService)->CalculateAfr();
	}
}