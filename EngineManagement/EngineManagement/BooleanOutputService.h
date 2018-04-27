#include "HardwareAbstractionCollection.h"
#include "IBooleanOutputService.h"

using namespace HardwareAbstraction;

#if !defined(BOOLEANOUTPUTSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define BOOLEANOUTPUTSERVICE_H
namespace IOService
{
	struct __attribute__((__packed__)) BooleanOutputServiceConfig
	{
	private:
		BooleanOutputServiceConfig()
		{

		}
		
	public:
		static BooleanOutputServiceConfig* Cast(void *p)
		{
			return (BooleanOutputServiceConfig *)p;
		}
		
		unsigned int Size()
		{
			return sizeof(BooleanOutputServiceConfig);
		}

		unsigned char Pin;
		bool NormalOn;
	};

	class BooleanOutputService : public IBooleanOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const BooleanOutputServiceConfig *_config;
		bool _highZ;
		
	public:
		BooleanOutputService(const HardwareAbstractionCollection *, const BooleanOutputServiceConfig *, bool highZ);

		void OutputSet();
		void OutputReset();
		void OutputWrite(bool value);
	};
}
#endif