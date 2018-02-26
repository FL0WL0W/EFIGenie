#include "Services.h"

#ifdef ILambdaSensorServiceExists
namespace EngineManagement
{
	ILambdaSensorService *CurrentLambdaSensorService;

	ILambdaSensorService *CreateLambdaSensorService(void *config)
	{
		unsigned char lambdaSensorId = *((unsigned char*)config);
		switch (lambdaSensorId)
		{
		case 0:
			return 0;
		}
	}
}
#endif