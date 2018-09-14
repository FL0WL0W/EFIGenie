#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IBooleanOutputService.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(BOOLEANOUTPUTSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define BOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	PACK(
	struct BooleanOutputServiceConfig
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
		bool HighZ;
	});

	class BooleanOutputService : public IBooleanOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const BooleanOutputServiceConfig *_config;
		
	public:
		BooleanOutputService(const HardwareAbstractionCollection *, const BooleanOutputServiceConfig *);

		void OutputSet();
		void OutputReset();
		void OutputWrite(bool value);
	};
}
#endif