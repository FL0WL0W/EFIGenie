#include "HardwareAbstractionCollection.h"
#include "IBooleanInputService.h"

#if !defined(BOOLEANINPUTSERVICE_H) && defined(IBOOLEANINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define BOOLEANINPUTSERVICE_H
namespace IOServiceLayer
{
	struct __attribute__((__packed__)) BooleanInputServiceConfig
	{
	private:
		BooleanInputServiceConfig()
		{

		}
	public:
		static BooleanInputServiceConfig* Cast(void *p)
		{
			return (BooleanInputServiceConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(BooleanInputServiceConfig);
		}

		unsigned char Pin;
		bool Inverted;
	};

	class BooleanInputService : public IBooleanInputService
	{
		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
		BooleanInputServiceConfig *_config;
	public:
		BooleanInputService(const HardwareAbstraction::HardwareAbstractionCollection *, BooleanInputServiceConfig *);
		void ReadValue();
	};
}
#endif