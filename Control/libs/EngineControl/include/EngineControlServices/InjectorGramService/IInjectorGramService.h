#include "Service/ServiceLocator.h"

using namespace Service;

#ifndef IINJECTORGRAMSERVICE_H
#define IINJECTORGRAMSERVICE_H
namespace EngineControlServices
{			
	class IInjectorGramService
	{
	public:
		float *InjectorGrams = 0;
		virtual void CalculateInjectorGrams() = 0;

		static void CalculateInjectorGramsCallBack(void *injectorGramService);
		static void* CreateInjectorGramService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif