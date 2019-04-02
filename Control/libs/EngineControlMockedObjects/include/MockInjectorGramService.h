#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"

#ifndef MOCKINJECTORGRAMSERVICE_H
#define MOCKINJECTORGRAMSERVICE_H
namespace EngineControlServices
{
	class MockInjectorGramService : public IInjectorGramService
	{
	public:
		MOCK_METHOD0(CalculateInjectorGrams, void());
	};
}
#endif