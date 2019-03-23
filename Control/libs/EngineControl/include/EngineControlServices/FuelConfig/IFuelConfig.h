#ifndef IFUELCONFIG_H
#define IFUELCONFIG_H
namespace EngineControlServices
{			
	class IFuelConfig
	{
	public:
		virtual float GetFuelGrams(unsigned char injector) = 0;
	};
}
#endif